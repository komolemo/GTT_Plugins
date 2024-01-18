//=============================================================================
// RPG Maker MZ - GTT_Base
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 
 * @author Getatumuri
 *
 * @help GTT_Base.js
 *
 * 
 * 
 * 
 */
/*:ja
 * @target MZ
 * @plugindesc GTTプラグインに共通の処理を集める
 * @author Getatumuri
 * @help GTT_Base.js
 * 視界処理
 * アイテムシーンのレイアウト変更
 * アイテムにマップ上での発動射程の概念を追加
 * @param
 * @text ==== 影 ====
 * 
 * @param SHADOW_RGBA_LIST
 * @text 影色リスト
 * @desc 影のRGBAリスト
 * @type struct<shadowRgba>
 */

/*~struct~shadowRgba:ja
 * @param dungeonVoidShadow
 * @text 未到達領域(ダンジョン)
 * @desc ダンジョンの未到達領域の影のRGBA
 * @type string
 * @
 * @param dungeonOuterShadow
 * @text 視界外(ダンジョン)
 * @desc ダンジョンの視界外の影のRGBA
 * @type string
 * @
 * @param dungeonInSightShadow
 * @text 半視界内(ダンジョン)
 * @desc ダンジョンの半視界内の影のRGBA
 * @type string
 * @
 * @param fieldVoidShadow
 * @text 未到達領域(ダンジョン)
 * @desc フィールドの未到達領域の影のRGBA
 * @type string
 * @
 * @param fieldOuterShadow
 * @text 視界外(ダンジョン)
 * @desc フィールドの視界外の影のRGBA
 * @type string
 * @
 * @param fieldInSightShadow
 * @text 半視界内(ダンジョン)
 * @desc フィールドの半視界内の影のRGBA
 * @type string
*/

(() => {
    const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
    const params = PluginManager.parameters(pluginName);
    const script = document.currentScript;

    // ================================================================================================================================
    //
    // 入力仕様の変更(トリアコンタン: FixSimultaneouslyPress.js)                 
    //         
    // ================================================================================================================================
    // const _Input_update = Input.update;
    // Input.update = function() {
    //     this._latestButtons = [];
    //     for (const name in this._currentState) {
    //         if (this._currentState[name] && !this._previousState[name]) {
    //             this._latestButtons.push(name);
    //         }
    //     }
    //     _Input_update.apply(this, arguments);
    // }

    // const _Input__updateGamepadState = Input._updateGamepadState;
    // Input._updateGamepadState = function(gamepad) {
    //     _Input__updateGamepadState.apply(this, arguments);
    //     gamepad.buttons.forEach(function(button, index) {
    //         if (button.pressed) {
    //             const buttonName = this.gamepadMapper[index];
    //             if (buttonName && !this._previousState[buttonName]) {
    //                 this._latestButtons.push(buttonName);
    //             }
    //         }
    //     }, this);
    // }

    // const _Input_isTriggered = Input.isTriggered;
    // Input.isTriggered = function(keyName) {
    //     const result = _Input_isTriggered.apply(this, arguments);
    //     console.log(this._latestButtons)
    //     return result || (this._latestButtons.contains(keyName) && this._pressedTime === 0);
    // }

    // ================================================================================================================================
    //
    // 操作の変更                    
    //         
    // ================================================================================================================================
    // マウスの左クリックで攻撃、右クリックで移動に変更(LoL, Civ形式)
    Scene_Map.prototype.processMapTouch = function() {
        if (TouchInput.isCancelled() || this._touchCount > 0) { // TouchInput.isTriggered() || this._touchCount > 0
            if (TouchInput.isCancelled() && !this.isAnyButtonPressed()) { // TouchInput.isPressed() && !this.isAnyButtonPressed()
                if (this._touchCount === 0 || this._touchCount >= 15) {
                    this.onMapTouch();
                }
                this._touchCount++;
            } else {
                this._touchCount = 0;
            }
        }
    }
    Scene_Map.prototype.isMenuCalled = function() {
        return Input.isTriggered("menu");
        // return Input.isTriggered("menu") || TouchInput.isCancelled();
    }
    // ================================================================================================================================
    //
    // 視界                     
    //         
    // ================================================================================================================================

    class GTT_Sight {
        constructor(value) {
            this._characterId = 0;
            this._sightRange = 0;
            this._latest = true;
            this._sightMode = 0; // 1: 遮蔽のみ 2: 遮蔽 + 茂み
            // メソッド用プロパティ
            this._sightLevelMap = [];
            this._reachedMap = [];
            this._mapInSight = [];
            this._tileInSight = [];
            this._tileScreenDataInSight = [];
            // フィルターメソッド用プロパティ
            this._tileFiltered = [];
            this._tileScreenDataFiltered = [];
            if (value) {
                this.setCharacterId(value);
            }
        }
        // ----------------------------------------------------------------
        // 数値設定
        // 
        setSight(value) {
            this._sightRange = value;
        }
        // ----------------------------------------------------------------
        // 基礎データ
        // 
        subjectCharacter() {
            if (this._characterId < 0) {
                return $gamePlayer
            } else
            if (this._characterId > 0) {
                return $gameMap.event(this._characterId);
            }
            return null;
        }
        setCharacterId(value) {
            this._characterId = value;
        }
        sight() {
            return this._sightRange;
        }
        sightRange() {
            return this._sightRange;
        }
        sightLevelMap() {
            return this._sightLevelMap;
        }
        tileInSight() {
            return this._tileInSight;
        }
        tileFiltered() {
            return this._tileFiltered;
        }
        // データを更新したか(更新したときのみ視界描画を更新する)
        isLatest() {
            return this._latest;
        }
        setLatest(value) {
            this._latest = value;
        }
        // ----------------------------------------------------------------
        // 上位処理
        // 
        updateSight() {
            this.createTileMapInSight();
            this.createSightData();
            this.createTileInSight();
            this.clearSubProp();
            this.setLatest(true);
        }
        createSight(value) {
            this.setSight(value);
            this.updateSight();
        }
        clearSubProp() {
            // this._mapInSight = [];
            this._reachedMap = [];
            this._blocks = [];
            this._indexOnDistance = [];
        }
        // ----------------------------------------------------------------
        //
        // 視界データ生成(汎用)                    
        // 
        sightMode() {
            return this._sightMode; // 1: 遮蔽のみ 2: 遮蔽 + 茂み
        }
        setSightMode(value) {
            this._sightMode = value;
        }
        // ----------------------------------------------------------------
        // 生成処理
        // 
        // 視界になりうる範囲の座標を集める
        createTileMapInSight() {
            this._mapInSight = [];
            const range = this._sightRange;
            for (let i = - range; i <= range; i++) {
                this._mapInSight[range + i] = [];
                for (let j = - range; j <= range; j++) {
                    let x = this.subjectCharacter().x + j;
                    if (x < 0 || x >= $gameMap.width()) {x = -1};
                    let y = this.subjectCharacter().y + i;
                    if (y < 0 || y >= $gameMap.height()) {y = -1};
                    this._mapInSight[range + i][range + j] = [x, y];
                }
            }
        }
        // 視界レベルマップを作る
        createSightData() {
            this.checkSight();
            this._sightLevelMap = this._reachedMap.map((v) => {
                return v.map((w) => {
                    if (w >= 0.8) {
                        return 2; //経路２本以上あったら視界内
                    } else if (w >= 0.4) {
                        return 1; //経路1本だったら半視界内
                    } else {
                        return 0; //経路0本だったら視界外
                    }   
                })     
            })
        }
        // 視界範囲になりうる範囲の視界の届き様をまとめる
        checkSight() {
            //空白のリンクマップを生成
            this._reachedMap = Array.from({length: this._mapInSight.length}, () => Array(this._mapInSight[0].length).fill(1));
            // 遮蔽物リストの生成
            this.createBlocksList();
            const range = this._sightRange;
            for (let d = 1; d <= range; d++) {
                this.createIndexOnDistance(d);
                for (const index of this._indexOnDistance) {
                    this.checkSightEach(index[0], index[1]);
                }
            }
        }
        // ある距離のタイルを収集
        createIndexOnDistance(value) {
            this._indexOnDistance = [];
            const centerX = this._sightRange;
            const centerY = this._sightRange;
            // x座標を基準に、距離valueのタイルのリストを作成する
            for (let dy = - value; dy <= value; dy++) {
                if (Math.abs(dy) === value) {
                    for (let dx = - value; dx <= value; dx++) {
                        if (this._reachedMap[centerY + dy][centerX + dx]) {
                            this._indexOnDistance.push([centerX + dx, centerY + dy]);
                        }
                    }
                } else {
                    if (this._reachedMap[centerY + dy][centerX - value]) {
                        this._indexOnDistance.push([centerX - value, centerY + dy]);
                    }
                    if (this._reachedMap[centerY + dy][centerX + value]) {
                        this._indexOnDistance.push([centerX + value, centerY + dy]);
                    }
                }
            }
        }
        createBlocksList() {
            this._blocks = [];
            const p = this._sightRange;
            const range = this._sightRange;
            for (let dy = - range; dy <= range; dy++) {
                for (let dx = - range; dx <= range; dx++) {
                    // 遮蔽がある場合は、遮蔽を追加する
                    this.addBlocks(p + dx, p + dy);
                }
            }
        }
        // そのマスが遮蔽に隠れているか判定
        checkSightEach(x, y) {
            // 遮蔽に隠れているか
            this.updateSightEach(x, y);
        }
        updateSightEach(x, y) {
            const p = this._sightRange;
            const range = (x - p) ** 2 + (y - p) ** 2;
            const aTanEdge = this.atanOnTileEdge(x, y);
            if ((aTanEdge[0] <= 0 && aTanEdge[0] >= - Math.PI / 2) && (aTanEdge[1] >= 0 && aTanEdge[1] <= Math.PI / 2)) {
                const aTanEdgeMin = aTanEdge[0];
                const aTanEdgeMax = aTanEdge[1];
                const shadowEdge = [aTanEdgeMin, aTanEdgeMax];
                const midShadowEdges = [];
                for (let i = 0; i < this._blocks.length && this._reachedMap[y][x] > 0; i++) {
                    const prop = this._blocks[i];
                    const propMin = Math.min(prop[0], prop[1]);
                    const propMax = Math.max(prop[0], prop[1]);
                    const isOnXaxis = (propMin <= 0 && propMin <= - Math.PI / 2) && (propMax >= 0 && propMax >= Math.PI / 2);
                    const aTanShadowMin = isOnXaxis ? propMax : propMin;
                    const aTanShadowMax = isOnXaxis ? propMin : propMax;

                    if (
                        aTanShadowMin <= aTanEdgeMax && aTanShadowMax >= aTanEdgeMax &&
                        (range > prop[2] && range > 1)
                    ) {
                        shadowEdge[1] = Math.max(Math.min(aTanShadowMin, shadowEdge[1]), aTanEdgeMin);
                    }
                    if (
                        aTanShadowMax >= aTanEdgeMin && aTanShadowMin <= aTanEdgeMin &&
                        (range > prop[2] && range > 1)
                    ) {
                        shadowEdge[0] = Math.min(Math.max(aTanShadowMax, shadowEdge[0]), aTanEdgeMax);
                    }
                    // 影が完全にaTanEdgeの間に入っている
                    if (
                        aTanShadowMin > aTanEdgeMin && aTanShadowMax < aTanEdgeMax &&
                        ((range > prop[2]) && range > 1)
                    ) {
                        midShadowEdges[midShadowEdges.length] = [aTanShadowMin, aTanShadowMax];
                    }

                    if (shadowEdge[0] >= shadowEdge[1]) {
                        this._reachedMap[y][x] = 0;
                    }
                }
                if (this._reachedMap[y][x]) {
                    midShadowEdges.sort((a, b) => {return a[0] - b[0]});
                    for (let i = 0; i < midShadowEdges.length; i++) {
                        if(shadowEdge[0] >= midShadowEdges[i][0]) {
                            shadowEdge[0] = midShadowEdges[1];
                        }
                        if(shadowEdge[1] <= midShadowEdges[i][1]) {
                            shadowEdge[1] = midShadowEdges[0];
                        }
                    }
                    this._reachedMap[y][x] = Math.max((shadowEdge[1] - shadowEdge[0]) / (aTanEdgeMax - aTanEdgeMin), 0);
                }
            } else {
                const edge = [aTanEdge[0], aTanEdge[1]].map((v) => {return v >= 0 ? v : v + Math.PI * 2}).sort((a, b) => {return a - b});
                const aTanEdgeMin = edge[0];
                const aTanEdgeMax = edge[1];
                const shadowEdge = [aTanEdgeMin, aTanEdgeMax];
                const midShadowEdges = [];
                for (let i = 0; i < this._blocks.length && this._reachedMap[y][x] > 0; i++) {
                    const prop = this._blocks[i];
                    const propMin = Math.min(prop[0], prop[1]);
                    const propMax = Math.max(prop[0], prop[1]);

                    if ((propMin <= 0 && propMin >= - Math.PI / 2) && (propMax >= 0 && propMax <= Math.PI / 2)) {
                        // ----------------------------------------------------------------
                        // 影の端が第一象限と第四象限の２つにまたがっている
                        // 
                        const aTanShadowMin = propMin + Math.PI * 2;
                        const aTanShadowMax = propMax;

                        // 第一象限
                        if (
                            aTanShadowMax >= aTanEdgeMin && // aTanShadowMax <= aTanEdgeMax && 
                            ((range > prop[2]) && range > 1)
                        ) {
                            shadowEdge[0] = Math.min(Math.max(aTanShadowMax, shadowEdge[0]), aTanEdgeMax);
                        }
                        // 第四象限
                        if (
                            aTanShadowMin <= aTanEdgeMax && // aTanShadowMin >= aTanEdgeMin && 
                            ((range > prop[2]) && range > 1)
                        ) {
                            shadowEdge[1] = Math.max(Math.min(aTanShadowMin, shadowEdge[1]), aTanEdgeMin);
                        }
                        // 影が完全にaTanEdgeの間に入っている
                        if (
                            aTanShadowMin > aTanEdgeMin && aTanShadowMax < aTanEdgeMax &&
                            ((range > prop[2]) && range > 1)
                        ) {
                            midShadowEdges[midShadowEdges.length] = [aTanShadowMin, aTanShadowMax];
                        }

                        if (shadowEdge[0] >= shadowEdge[1]) {
                            this._reachedMap[y][x] = 0;
                        }
                    } else {
                        // ----------------------------------------------------------------
                        // 影の端が第一象限と第四象限の２つにまたがっていない
                        // 
                        const shadow = [propMin, propMax].map((v) => {return v >= 0 ? v : v + Math.PI * 2}).sort((a, b) => {return a - b});
                        const aTanShadowMin = shadow[0];
                        const aTanShadowMax = shadow[1];
                        // 一部重なっている
                        if (
                            // 遮蔽(this._blocks[i])による影の傾きの最小値が、タイル(x, y)を収める視界範囲の傾きの最大値よりも小さい かつ
                            // 遮蔽(this._blocks[i])による影の傾きの最大値が、タイル(x, y)を収める視界範囲の傾きの最小値よりも小さい かつ
                            // playerとタイル(x, y)の中心点の距離が、playerと遮蔽(this._blocks[i])の中点の距離よりも大きいとき、
                            // タイルの視界範囲が遮蔽によって狭められている
                            aTanShadowMin <= aTanEdgeMax && aTanShadowMax >= aTanEdgeMax &&
                            ((range > prop[2]) && range > 1)
                        ) {
                            // 遮蔽(this._blocks[i])による影の傾きの最小値 と 現在の影データ(タイル(x, y)を収める視界範囲の傾きの最大最小値 からどこまでの角度を影に含めるかを収めた配列)
                            // の大きい方の数値[1]のどちらが小さいか比較する
                            // もし 遮蔽による影の傾きの最小値 の方が小さかった場合は、遮蔽による影の傾きの最小値 が 現在の影データを収める視界範囲の傾きの最小値よりも大きい方の数値を
                            // 影データの大きい方[1]に格納する
                            shadowEdge[1] = Math.max(Math.min(aTanShadowMin, shadowEdge[1]), aTanEdgeMin);
                        }
                        if (
                            aTanShadowMax >= aTanEdgeMin && aTanShadowMin <= aTanEdgeMin &&
                            ((range > prop[2]) && range > 1)
                        ) {
                            shadowEdge[0] = Math.min(Math.max(aTanShadowMax, shadowEdge[0]), aTanEdgeMax);
                        }
                        // 影が完全にaTanEdgeの間に入っている
                        if (
                            aTanShadowMin > aTanEdgeMin && aTanShadowMax < aTanEdgeMax &&
                            ((range > prop[2]) && range > 1)
                        ) {
                            midShadowEdges[midShadowEdges.length] = [aTanShadowMin, aTanShadowMax];
                        }

                        if (shadowEdge[0] >= shadowEdge[1]) {
                            this._reachedMap[y][x] = 0;
                        }
                    }
                }
                if (this._reachedMap[y][x]) {
                    midShadowEdges.sort((a, b) => {return a[0] - b[0]});
                    for (let i = 0; i < midShadowEdges.length; i++) {
                        if(shadowEdge[0] >= midShadowEdges[i][0]) {
                            shadowEdge[0] = midShadowEdges[1];
                        }
                        if(shadowEdge[1] <= midShadowEdges[i][1]) {
                            shadowEdge[1] = midShadowEdges[0];
                        }
                    }
                    this._reachedMap[y][x] = Math.max((shadowEdge[1] - shadowEdge[0]) / (aTanEdgeMax - aTanEdgeMin), 0);
                }
            }
        }
        // 遮蔽データを取得してthis._blocksに加える
        addBlocks(x, y) {
            const p = this._sightRange;
            // 左上
            const dlist = new Set();
            if(x <= p && y <= p) {
                if (!this.isPassable(x, y, 8) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(8);
                }
                if (!this.isPassable(x, y, 4) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(4);
                }
            }
            // 右上
            if(x >= p && y <= p) {
                if (!this.isPassable(x, y, 8) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(8);
                }
                if (!this.isPassable(x, y, 6) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(6);
                }
            }
            // 左下
            if(x <= p && y >= p) {
                if (!this.isPassable(x, y, 4) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(4);
                }
                if (!this.isPassable(x, y, 2) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(2);
                }
            }
            // 右下
            if(x >= p && y >= p) {
                if (!this.isPassable(x, y, 6) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(6);
                }
                if (!this.isPassable(x, y, 2) || this.isSightHalfBlocked(x, y)) {
                    dlist.add(2);
                }
            }
            for (const d of dlist) {
                if (d === 2) {
                    this._blocks[this._blocks.length] = this.blockProp(x, y + 1, 1, 0);
                }
                if (d === 4) {
                    this._blocks[this._blocks.length] = this.blockProp(x, y, 0, 1);
                }
                if (d === 6) {
                    this._blocks[this._blocks.length] = this.blockProp(x + 1, y, 0, 1);
                }
                if (d === 8) {
                    this._blocks[this._blocks.length] = this.blockProp(x, y, 1, 0);
                }
            }
        }
        // 遮蔽データを生成して返す
        // データの中身は[プレイヤーの座標と遮蔽の一辺の端1の傾き、プレイヤーの座標と遮蔽の一辺の端2の傾き、遮蔽の一辺の中点とプレイヤー座標の傾き]
        blockProp(x, y, nx, ny) {
            const p = this._sightRange + 0.5;
            let atan1 = Math.atan2(y - p, x - p);
            let atan2 = Math.atan2(y + ny - p, x + nx - p);
            const range = (x + nx / 2 - p) ** 2 + (y + ny / 2 - p) ** 2;
            return [atan1, atan2, range];
        }
        // あるタイルのプレイヤーの点に対する視界の角度の最大値と最小値
        // 基本的には、playerの点とタイル(x, y)の中心点を結ぶ辺が直角に近く交わるような対角を結ぶ辺を形成する対角２つとplayerの点の傾きを返す
        atanOnTileEdge(x, y) {
            // playerの視界内となる範囲内での座標
            // 視界範囲はplayerの視界*2+1を一辺とする正方形なので、その座標はx, yともにthis._sightRangeとなる
            const center = this._sightRange + 0.5;
            const point = [[0, 0], [1, 0], [0, 1], [1, 1]];
            const atanList = [];
            for (const p of point) {
                let atan = Math.atan2(y + p[1] - center, x + p[0] - center);
                atanList[atanList.length] = atan;
            }
            atanList.sort((a, b) => {return a - b});
            const min = Math.min(...atanList);
            const max = Math.max(...atanList);
            if ((min <= 0 && min >= - Math.PI / 2) && (max >= 0 && max <= Math.PI / 2)) { // x軸を挟んでいるマスの場合
                return [atanList[1], atanList[2]];
            } else { // それ以外の通常の場合
                return [atanList[0], atanList[3]];
            }
        }
        // あるタイル(x, y)のある方向dが通行可能かどうか
        isPassable(x, y, d) {
            const tile = this._mapInSight[y][x];
            const tileX = tile[0];
            const tileY = tile[1];
            return $gameMap.isPassable(tileX, tileY, d) || $gameMap.terrainTag(tileX, tileY) === 1;
        }
        // あるタイル(x, y)が茂みかどうか
        isSightHalfBlocked(x, y) {
            return this.isBush(x, y) && this.sightMode() === 2;
        }
        isBush(x, y) {
            const tile = this._mapInSight[y][x];
            const tileX = tile[0];
            const tileY = tile[1];
            return $gameMap.isBush(tileX, tileY);
        }
        // ----------------------------------------------------------------
        // 視界の画面上の情報を生成          
        // 
        createTileInSight() {
            this._tileInSight = [];
            for(let y = 0; y < this._sightLevelMap.length; y++) {
                for(let x = 0; x < this._sightLevelMap[y].length; x++) {
                    if(this._sightLevelMap[y][x] > 0) {
                        this._tileInSight[this._tileInSight.length] = this._mapInSight[y][x];
                    }
                }
            }
        }
        tileScreenDataInSight() {
            return this._tileInSight.map((v) => {
                return this.convertTileScreenData(v[0], v[1]);
            })
        }
        convertTileScreenData(x, y) {
            const screenX = this.subjectCharacter().screenX() + ((x - this.subjectCharacter().x) - 1 / 2) * $gameMap.tileWidth();
            const screenY = this.subjectCharacter().screenY() + ((y - this.subjectCharacter().y) - 1) * $gameMap.tileHeight() + 6;
            return [screenX, screenY];
        }
        // ----------------------------------------------------------------
        // 視界内のイベント         
        // 
        tileEventsOnInSight() {
            return this._tileInSight.filter((v) => {return $gameMap.eventIdXy(v[0], v[1]) > 0});
        }
        eventsInSight() {
            const events = [];
            for (const v of this._tileInSight) {
                if ($gameMap.eventIdXy(v[0], v[1])) {
                    events[events.length] = $gameMap.events(v[0], v[1]);
                }
            }
            return events;
        }
        // ----------------------------------------------------------------
        // 視界内のタイルのうち、特定のタイルを抽出するためのメソッドを追加するメソッド         
        // 
        setFilterHandler(symbol, method) {
            this[symbol] = method;
        }
        callFilterHandler(symbol) {
            this._tileFiltered = this._tileInSight.filter((v) => {return this[symbol](...v)});
        }
        tileScreenDataFiltered() {
            return this._tileFiltered.map((v) => {
                return this.convertTileScreenData(v[0], v[1]);
            })
        }
        // ----------------------------------------------------------------
        // おまけで、視界内のプレイヤーの座標を抽出(敵用)      
        // 
        isPlayerInSight() {
            return this._tileInSight.some((v) => {return v[0] === $gamePlayer.x && v[1] === $gamePlayer.y})
        }
    }

    // ================================================================================================================================
    // 
    // Game_Characterの追加定義
    // 
    // ================================================================================================================================

    const _Game_Character_initialize = Game_Character.prototype.initialize;
    Game_Character.prototype.initialize = function() {
        _Game_Character_initialize.apply(this, arguments);
        this._sight = new GTT_Sight();
        this._sight.setSightMode(2);
    }

    Game_Character.prototype.sight = function() {
        return this._sight;
    }

    // ================================================================================================================================
    //
    // Game_Playerの追加定義                            
    //         
    // ================================================================================================================================

    const _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        _Game_Player_initialize.apply(this, arguments);
        this._lastX = 0;
        this._lastY = 0;
        this.initSight();
    }

    Game_Player.prototype.initSight = function() {
        this._sight.setCharacterId(-1);
        this._cloud = new GTT_Sight();
        this._cloud.setCharacterId(-1);
        this._cloud.setSight(11);
        this._itemScope = new GTT_Sight();
        this._itemScope.setCharacterId(-1);
    }

    const _Game_Player_executeMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function() {
        _Game_Player_executeMove.apply(this, arguments);
        this.updateAtMove();
    }

    const _Game_Player_locate = Game_Player.prototype.locate;
    Game_Player.prototype.locate = function() {
        _Game_Player_locate.apply(this, arguments);
        this.updateLastXy();
    }

    Game_Player.prototype.updateAtMove = function() {
        this._sight.updateSight();
        if($gameFarm.isInField()) {
            this._cloud.updateSight();
            this._cloud.setSightMode(1);
        }
        // $gameFarm.updateFieldEvents();
        // $gameMap.updateEventsVisibility();
        $gameTemp.reserveCommonEvent(4);
        this.updateLastXy();
    }

    Game_Player.prototype.updateLastXy = function() {
        this._lastX = this.x;
        this._lastY = this.y;
    }

    Game_Player.prototype.lastX = function() {
        return this._lastX;
    }

    Game_Player.prototype.lastY = function() {
        return this._lastY;
    }

    Game_Player.prototype.cloud = function() {
        return this._cloud;
    }

    Game_Player.prototype.itemScope = function() {
        return this._itemScope;
    }

    // ================================================================================================================================
    // 
    // Sprite
    // 
    // ================================================================================================================================

    
    // --------------------------------------------------------------------------------------------------------------------------------
    //                  
    // 視界関係の処理
    // 
    // --------------------------------------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------
    // Spriteset_Mapの追加定義                             
    //         
    // 
    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.apply(this, arguments);
        this.createSightShadow();
        this.createSightCloud();
    }
    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.apply(this, arguments);
        this.updateSightShadow();
        this.updateSightCloud();
    }
    // ----------------------------------------------------------------
    // 影描画                             
    // 
    Spriteset_Map.prototype.createSightShadow = function() {
        this._backgroundFilter = new PIXI.filters.BlurFilter();
        const bitmap = new Bitmap(Graphics.boxWidth + $gameMap.tileWidth() * 2, Graphics.boxHeight + $gameMap.tileHeight() * 2);
        // const bitmap = new Bitmap(Graphics.boxWidth + $gameMap.tileWidth() * 2, Graphics.boxWidth + $gameMap.tileHeight() * 2);
        this._sightShadow = new Sprite_SightShadow(bitmap);
        this._sightShadow.z = 8.5;
        this._tilemap.addChild(this._sightShadow);
    }
    Spriteset_Map.prototype.updateSightShadow = function() {
        this._sightShadow.updateSight();
        this._sightShadow.filters = [this._backgroundFilter];
    }
    // ----------------------------------------------------------------
    // 雲描画                             
    // 
    Spriteset_Map.prototype.createSightCloud = function() {
        this._backgroundFilter = new PIXI.filters.BlurFilter(16);
        const bitmap = new Bitmap(Graphics.boxWidth + $gameMap.tileWidth() * 2, Graphics.boxHeight + $gameMap.tileHeight() * 2);
        this._sightCloud = new Sprite_SightCloud(bitmap);
        this._sightCloud.z = 8.6;
        this._tilemap.addChild(this._sightCloud);
    }
    Spriteset_Map.prototype.updateSightCloud = function() {
        this._sightCloud.updateSight();
        this._sightCloud.filters = [this._backgroundFilter];
    }
    // ----------------------------------------------------------------
    // Sprite_GTT_Sight                    
    //         
    // 
    class Sprite_GTT_Sight extends Sprite {
        constructor(bitmap) {
            super(bitmap);
            this._voidShadowRgba = "";
            this._outerShadowRgba = "";
            this._innerShadowRgba = "";
            this._exploredMaps = "";
            this._sightLevelMap = "";
            this._cloudMap = "";
            this._tileWidth = $gameMap.tileWidth();
            this._tileHeight = $gameMap.tileHeight();
            this._outerX = 0;
            this._outerY = 0;
            this._outerWidth = Graphics.boxWidth + this._tileWidth + 8;
            this._outerHeight =  Graphics.boxHeight + this._tileHeight + 8;
            this._innerX = 0;
            this._innerY = 0;
            this._voidX = 0;
            this._voidY = 0;
            // this._voidWidth = ($gamePlayer.cloud().sightRange() * 2 + 1) * this._tileWidth;
            // this._voidHeight = ($gamePlayer.cloud().sightRange() * 2 + 1) * this._tileHeight;
            this._screenCoverWidth = Graphics.boxWidth + 8 + this._tileWidth * 2;
            this._screenCoverHeight = Graphics.boxHeight + 8 + this._tileHeight * 2;
            this._rgbaList = JSON.parse(params.SHADOW_RGBA_LIST);
        }
        update() {
            Sprite.prototype.update.call(this);
            this.updatePosition();
        }
        updatePosition() {
            this.x = - ($gamePlayer._realX - $gamePlayer.lastX() + 1) * this._tileWidth;
            this.y = - ($gamePlayer._realY - $gamePlayer.lastY() + 1) * this._tileHeight;
        }
    }
    // ----------------------------------------------------------------
    // Sprite_SightShadow                          
    //         
    // 
    class Sprite_SightShadow extends Sprite_GTT_Sight {
        constructor(bitmap) {
            super(bitmap);
        }
        // 影を全除去
        clearSightShadow() {
            this.removeChildren()
        }
        updateSightData() {
            if ($gameFarm.isInDungeon()) {
                this._exploredMaps = $gameFarm.currentDungeon().currentExploredMap();
            }
            this._sightLevelMap = $gamePlayer.sight().sightLevelMap();
            this._voidShadowRgba = this.shadowRgba()[0];
            this._outerShadowRgba = this.shadowRgba()[1];
            this._innerShadowRgba = this.shadowRgba()[2];
            this._innerX = $gamePlayer.screenX() - $gamePlayer.sight().sightRange() * this._tileWidth + this._tileWidth / 2;
            this._innerY = $gamePlayer.screenY() - $gamePlayer.sight().sightRange() * this._tileHeight + 6;
        }
        // 影のアップデート
        updateSight() {
            // 視界情報が最新の時のみ更新することで負荷軽減
            if ($gamePlayer.sight().isLatest()) {
                // 影の初期化
                this.bitmap.clear();
                // データ更新
                this.updateSightData();
                // 影マップ生成
                if(this._sightLevelMap) {
                    // 未到達領域と到達領域を影で表現
                    // マスの探索情報済みをアップデートする(現在はダンジョン内のみ機能するようにしている)
                    this.updateVoidShadow();
                    //移動可能領域内視界外の影を生成
                    //ox, oy, ow, oh, ix, iy, rgba, array
                    this.updateOuterShadow();
                    //視界内の影を生成
                    this.updateInSightShadow();

                }
                // 視界状況を非最新に設定
                $gamePlayer.sight().setLatest(false);
            }
 
        }
        shadowRgba() {
            if ($gameFarm.isInDungeon()) {
                const rgba = [];
                rgba[0] = this._rgbaList.dungeonVoidShadow;
                rgba[1] = this._rgbaList.dungeonOuterShadow;
                rgba[2] = this._rgbaList.dungeonInSightShadow;
                return rgba;
            } else if ($gameFarm.isInField()) {
                const rgba = [];
                rgba[0] = this._rgbaList.fieldVoidShadow;
                rgba[1] = this._rgbaList.fieldOuterShadow;
                rgba[2] = this._rgbaList.fieldInSightShadow;
                return rgba;
            }
        }
        // ----------------------------------------------------------------
        // 未到達領域の影
        // 
        // 移動可能領域外の影を描写
        updateVoidShadow() {
            if($gameFarm.isInDungeon()) {
                this.bitmap.fillRect(this._voidX, this._voidY, this._screenCoverWidth, this._screenCoverHeight, this._voidShadowRgba);
                const x = Graphics.boxWidth / 2 - ($gamePlayer.x + 1 / 2) * this._tileWidth;
                const y = Graphics.boxHeight / 2 - ($gamePlayer.y + 1 / 2) * this._tileHeight + 6;
                const w = $gameFarm.currentDungeon().currentSize()[0] * this._tileWidth;
                const h = $gameFarm.currentDungeon().currentSize()[0] * this._tileHeight;
                this.bitmap.clearRect(x, y, w, h)

            }
            if (this._exploredMaps) {
                // ダンジョン内
                this.bitmap.fillRect(this._voidX, this._voidY, this._screenCoverWidth, this._screenCoverHeight, this._voidShadowRgba);
                for (let y = 0; y < this._exploredMaps.length; y++) {
                    for (let x = 0; x < this._exploredMaps[y].length; x++) {
                        if (this._exploredMaps[y][x] === 1) { //exploredMap[y][x] === 1 は探索済みを表す
                            const tileW = this._tileWidth;
                            const tileH = this._tileHeight;
                            const sx = this._outerX + x * tileW;
                            const sy = this._outerY + y * tileH;
                            this.bitmap.clearRect(sx, sy, tileW, tileH); //探索済みだったら不透明な影を除去する
                        }
                    }
                }
            }
        }
        // ----------------------------------------------------------------
        // 視界外の影
        // 
        updateOuterShadow() {
            this.bitmap.fillRect(this._outerX, this._outerY, this._outerWidth, this._outerHeight, this._outerShadowRgba);
            for(let y = 0; y < this._sightLevelMap.length; y++) {
                for(let x = 0; x < this._sightLevelMap[0].length; x++) {
                    if(this._sightLevelMap[y][x] > 0) { //半視界内あるいは視界内のマスに対しては影を除去する
                        const tileW = this._tileWidth;
                        const tileH = this._tileHeight;
                        const sx = this._innerX + x * tileW;
                        const sy = this._innerY + y * tileH;
                        this.bitmap.clearRect(sx, sy, tileW, tileH);
                    }
                }
            }
        }
        // ----------------------------------------------------------------
        // 視界内の影
        // 
        // 視界内の影を描写(半視界内の影を描写)
        updateInSightShadow() {
            for (let y = 0; y < this._sightLevelMap.length; y++) {
                for (let x = 0; x < this._sightLevelMap[0].length; x++) {
                    if (this._sightLevelMap[y][x] > 0 && this._sightLevelMap[y][x] < 2) { //暫定的な処理
                        const tileW = this._tileWidth;
                        const tileH = this._tileHeight;
                        const screenX = this._innerX + x * tileW;
                        const screenY = this._innerY + y * tileH;
                        this.bitmap.fillRect(screenX, screenY, tileW, tileH, this._innerShadowRgba)
                    }
                }
            }
        }
    }

    // ----------------------------------------------------------------
    // Sprite_SightCloud                       
    //         
    // 
    class Sprite_SightCloud extends Sprite_GTT_Sight {
        constructor(bitmap) {
            super(bitmap);
            this._cloudWidth = ($gamePlayer.cloud().sightRange() * 2 + 1) * this._tileWidth;
            this._cloudHeight = ($gamePlayer.cloud().sightRange() * 2 + 1) * this._tileHeight;
            // this.opacity = 240;
        }
        // 影のアップデート
        updateSight() {
            // 視界情報が最新の時のみ更新することで負荷軽減
            if ($gamePlayer.cloud().isLatest()) {
                // 影の初期化
                this.bitmap.clear();
                // データ更新
                this.updateSightData();
                // 雲マップ生成
                if(this._cloudMap) {
                    this.updateCloud();
                }
                // 視界状況を非最新に設定
                $gamePlayer.cloud().setLatest(false);
            }
    
        }
        updateSightData() {
            console.log("updateSightData")
            this._cloudMap = $gamePlayer.cloud().sightLevelMap();
            this._voidX = $gamePlayer.screenX() - $gamePlayer.cloud().sightRange() * this._tileWidth + this._tileWidth / 2;
            this._voidY = $gamePlayer.screenY() - $gamePlayer.cloud().sightRange() * this._tileHeight + 6;
        }
        updateCloud() {
            console.log("updateCloud")
            this.bitmap.fillRect(this._voidX, this._voidY, this._screenCoverWidth, this._screenCoverHeight, this._outerShadowRgba);
            this.bitmap.clearRect(this._outerX, this._outerY, this._outerWidth, this._outerHeight)

            this.bitmap.fillRect(this._voidX, this._voidY, this._cloudWidth, this._cloudHeight, "rgba(197, 187, 167, 200)"); // "rgba(201, 167, 103, 200)"
            for (let y = 0; y < this._cloudMap.length; y++) {
                for (let x = 0; x < this._cloudMap[y].length; x++) {
                    if (this._cloudMap[y][x] > 0) {
                        const tileW = this._tileWidth;
                        const tileH = this._tileHeight;
                        const sx = this._voidX + x * tileW;
                        const sy = this._voidY + y * tileH - 12;
                        this.bitmap.clearRect(sx, sy, tileW, tileH);
                    }
                }
            }
        }
    }

    class SpriteSet_ControlGuide extends Sprite {
        constructor() {
            // const bitmap = new Bitmap(Graphics.width, Graphics.height)
            super();
            this.createMouseGuide();
            this._baseWidth = 16;
            
        }
        get baseWidth() {
            return this._baseWidth;
        }
        createKeyGuide() {
            // tab
            // esc
        }
        createMouseGuide() {
            // マウス左ボタン
            this._guideMouseLeft = new Sprite_ControlGuide("mouseLeft");
            this._guideMouseLeft.hide();
            this.addChild(this._guideMouseLeft);
            // マウス右ボタン
            this._guideMouseRight = new Sprite_ControlGuide("mouseRight");
            this._guideMouseRight.hide();
            this.addChild(this._guideMouseRight);
            // ホイール上
            this._guideMouseWheelUp = new Sprite_ControlGuide("mouseWheelUp");
            this._guideMouseWheelUp.hide();
            this.addChild(this._guideMouseWheelUp);
            // ホイール下
            this._guideMouseWheelDown = new Sprite_ControlGuide("mouseWheelDown");
            this._guideMouseWheelDown.hide();
            this.addChild(this._guideMouseWheelDown);
        }
        drawMouseLeft(x, y) {
            this._guideMouseLeft.show();
            this._guideMouseLeft.move(x, y);
        }
        drawMouseRight(x, y) {
            this._guideMouseRight.show();
            this._guideMouseRight.move(x, y);
        }
        drawMouseWheelUp(x, y) {
            this._guideMouseWheelUp.show();
            this._guideMouseWheelUp.move(x, y);
        }
        drawMouseWheelDown(x, y) {
            this._guideMouseWheelDown.show();
            this._guideMouseWheelDown.move(x, y);
        }
    }

    class Sprite_ControlGuide extends Sprite {
        constructor(type, text) {
            super();
            this.bitmap = ImageManager.loadSystem("GTT_Button");
            this._baseWidth = 16;
            // this.setFrame(0, 0, 0, 0);
            // this.setFrame(0, 0, 16, 16);
            this.initButton(type);
            this.initText(text);
        }
        get baseWidth() {
            return this._baseWidth;
        }
        initButton(type) {
            const sw = this._baseWidth;
            const sh = this._baseWidth;
            const sx = sw;
            const sy = sh;
            switch(type) {
                case "button":
                    this.setFrame(0, 0, sw, sh);
                    break;
                case "buttonBig":
                    this.setFrame(sx, 0, sw * 2, sh);
                    break;
                case "mouseLeft":
                    this.setFrame(0, sy, sw, sh);
                    break;
                case "mouseRight":
                    this.setFrame(sx, sy, sw, sh);
                    break;
                case "mouseWheelUp":
                    this.setFrame(sx * 3, sy, sw, sh);
                    break;
                case "mouseWheelDown":
                    this.setFrame(sx * 4, sy, sw, sh);
                    break;
                default:
                    break;
            }
        }
        initText(text) {
            const w = this._buttonWidth;
            const h = this._buttonHeight;
            const bitmap = new Bitmap(w, h);
            this._text = new Sprite(bitmap);
            this.addChild(this._text);
            if (!!text) {
                this._text.bitmap.drawText(text, this.x, this.y, w, h, "center");
            }
        }
    }

    // ----------------------------------------------------------------
    // Scene     /Window           
    //         
    //  
    const _Scene_Base_initialize = Scene_Base.prototype.initialize;
    Scene_Base.prototype.initialize = function() {
        _Scene_Base_initialize.apply(this, arguments);
        this.createControlGuide();
    }
    Scene_Base.prototype.createControlGuide = function() {
        this._controlGuide = new SpriteSet_ControlGuide();
        this.addChild(this._controlGuide);
    }

    const _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function() {
        _Window_Base_initialize.apply(this, arguments);
        this.createControlGuide();
    }

    Window_Base.prototype.createControlGuide = function() {
        this._controlGuide = new SpriteSet_ControlGuide();
        this.addChild(this._controlGuide);
    }
}) ()
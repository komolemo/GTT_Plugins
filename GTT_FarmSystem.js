//=============================================================================
// RPG Maker MZ - GTT_FarmSystem
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 
 * @author Getatumuri
 *
 * @help GTT_FarmSystem.js
 *
 * 
 * 
 * 
 */

/*:ja
 * @target MZ
 * @plugindesc 
 * @author Getatumuri
 *
 * @help GTT_FarmSystem.js
 * 
 * @param AAA
 * @text ==== 採集 ====
 *
 * @param resorceTileListsGTT
 * @text 資源タイル群リスト
 * @desc 資源タイル群の設定
 * @type struct<ResorceTileLists>[]
 * 
 * @param regionZcoListGTT
 * @text Z座標リスト
 * @desc 
 * @type struct<regionZcoList>[]
 * 
 * @param BBB
 * @text ==== フィールド ====
 * 
 * @param FIELD_EVENTS_SETTING
 * @text 設定
 * @desc フィールドイベントに関する設定
 * @type struct<fieldEventsSetting>
 * 
 * @param FIELD_EVENTS_LIST
 * @text イベントリスト
 * @desc フィールドに出現するイベント
 * @type struct<fieldEvents>[]
 * 
 * @param FIELD_ENEMIES_LIST
 * @text エネミーリスト
 * @desc フィールドに出現する敵
 * @type struct<fieldEnemies>[]
 * 
 * @param CCC
 * @text ==== ダンジョン ====
 * 
 * @param DUNGEON_MAP_ID
 * @text マップID
 * @desc ダンジョンを生成するマップのID
 * @type number
 * @min 0
 * 
 * @param DUNGEON_EVENTS_LIST
 * @text イベントリスト
 * @desc ダンジョンに出現するイベント
 * @type struct<dungeonEvents>[]
 * 
 * @param DUNGEON_EVENTS_RATE
 * @text 出現確率
 * @desc 通路の数によるイベントの出現確率
 *       上から順に通路数が1/2/3/4の出現確率
 * @type number[]
 * @max 100
 * @min 0
 * 
 * @param DDD
 * @text ==== 影 ====
 * 
 * @param SHADOW_RGBA_LIST
 * @text 影色リスト
 * @desc 影のRGBAリスト
 * @type struct<shadowRgba>
 * 
 * @
 * 
 * //================================
 * //  ポイント設置関連
 * //================================
 * 
 * @command CREATE_FIELD_UNIQUE_EVENT_LIST
 * @text 設置(固有)
 * @desc 採取ポイントやダンジョンなどを設置
 * @
 * @arg minXy
 * @text 始点の座標
 * @desc 設置範囲の原点の座標
 * @type number[]
 * @
 * @arg maxXy
 * @text 終点の座標
 * @desc 設置範囲の終点の座標
 * @type number[]
 * @
 * @arg eventNum
 * @text 設置数
 * @desc ダンジョン系イベントを何個設置するか
 * @type number
 * @
 * @arg ruinEventNum
 * @text 廃墟設置数
 * @desc 廃墟イベントを何個設置するか
 * @type number
 * 
 * @command UPDATA_FIELD_EVENT_LIST
 * @text 更新
 * @desc アクティブ範囲内に入った固有イベントの設置/
 *       一般イベントのスポーン/範囲外に出たイベントのデスポーン
 * @
 * @arg minXy
 * @text 始点の座標
 * @desc 設置範囲の原点の座標
 * @type number[]
 * @
 * @arg maxXy
 * @text 終点の座標
 * @desc 設置範囲の終点の座標
 * @type number[]
 * @
 * 
 * @command FIELD_EVENT_SPAWN_AND_DESPAWN
 * @text スポーン/デスポーン
 * @desc フィールドイベントのスポーンとデスポーン
 * 
 * //================================
 * //  イベント可視化
 * //================================
 * 
 * @command VISUALIZE_EVENT
 * @text 可視化の準備
 * @desc 視界に入ったイベントを収集
 * @
 * @arg sight
 * @text 視界
 * @desc プレイヤーを中心とする視界の幅
 * @default 9
 * @
 * //================================
 * //  ダンジョン侵入・進行
 * //================================
 * 
 * @command PROCEED_DUNGEON
 * @text ダンジョン進行
 * @desc ダンジョン侵入・階層を進んだ時のマップ生成
 * 
 * @command BACK_DUNGEON
 * @text ダンジョン戻る
 * @desc ダンジョンで階層を戻った時のマップ生成
 * 
 * @command CREATE_TILEMAP_DATA
 * @text マップ生成準備
 * @desc ダンジョンを構成するタイルマップを生成
 *
 * @arg tilesetArray
 * @text タイル
 * @desc ダンジョンを構成するタイルIDの配列
 * @default [3, 1, 2, 0, 4]
 * 
 * @command CREATE_DUNGEON_EVENTS_SET_DATA
 * @text イベント設置準備
 * @desc ダンジョンイベントの設置データを生成
 * 
 * @
 * // ================================
 * // 影の更新
 * // ================================
 * @command UPDATE_SHADOW
 * @text 影の更新
 * @desc 
 * 
 */

/*~struct~ResorceTileLists:ja
 @param tileArrayNameGTT
 @text タイル群名
 @type string
 @desc タイル群名
 @
 @param tileArrayGTT
 @text タイル群
 @type string
 @desc 同資源のタイル群
 @
 @param resorceListsGTT
 @text 資源リスト
 @desc 
 @type struct<ResorceLists>[]
*/

/*~struct~ResorceLists:ja
 @param resorceGTT
 @text 資源
 @type item
 @desc
 @
 @param lotNumGTT
 @text くじの本数
 @type number
 @desc くじの本数
*/

/*~struct~regionZcoList:ja
 @param regionArrayGTT
 @text リージョンリスト
 @type string
 @desc 同じz座標のリージョン一覧
 @
 @param regionZcoGTT
 @text z座標
 @type number
 @desc このリージョンリストのz座標
 @
 @param regionListMemoGTT
 @text メモ
 @type string
 @desc 使用しない
*/

/*~struct~FarmPointData:ja
 @param farmPointName
 @text 名前
 @type string
 @desc 設置するイベントの名前
 @
 @param farmPointRate
 @text 出現確率
 @type number
 @desc 設置するイベントの出現確率
*/

// ================================================================
// 
// フィールドイベントの設定
// 
// ================================================================
/*~struct~fieldEventsSetting:ja
 * @param activeScope
 * @text アクティブ範囲
 * @desc イベントが存在し続ける範囲
 *       この範囲を出るとイベントは消される(データ上でのみ管理)
 * @type number
 * @default 30
 * @
 * 
 * @param spawnRate
 * @text スポーン確率
 * @desc 敵などの一時的なイベントが発声する確率
 * @type number
 * @default 2
 * @min 0
 * @max 100
*/
// ================================================================
// イベントリスト
// ================================================================
/*~struct~fieldEvents:ja
 * @param name
 * @text 名前
 * @desc 管理用
 * @
 * @param id
 * @text ID
 * @desc 設置するイベントのIDまたは名前
 * @type string
 * @
 * @param role
 * @text 特徴
 * @desc イベントの特徴
 *       データ上の処理に違いが出る
 * @type select
 * @default dungeon
 * 
 * @option ダンジョン
 * @value dungeon
 * 
 * @option 廃屋/廃墟
 * @value ruin
 * 
 * @option 敵性キャラクター
 * @value enemy_character
 * 
 * @option 中立キャラクター
 * @value neutral_character
 * 
 * @option 残骸
 * @value relic
 * 
 * @param requirement
 * @text 条件
 * @desc 出現可能な条件
 * @type struct<eventRequirment>
 * @
 * @param frequency
 * @text 出現しやすさ
 * @desc イベント配置のためのくじの本数
 * @number
 * @default 16
 * @
 * @param detailOptions
 * @text 詳細設定
 * @desc 見た目のバリエーション/リージョンごとの出現率など
 * @type struct<detailOptionsList>[]
 * @
*/

/*~struct~eventRequirment:ja
 * @param region
 * @text リージョン
 * @desc 出現するリージョン一覧
 *       (指定しなかった場合は全リージョンで出現)
 * @type number[]
 * @min 1
 * @max 255
 * 
 * @param notRegion
 * @text NGリージョン
 * @desc 出現しないリージョン一覧
 * @type number[]
 * @min 1
 * @max 255
 *
 * @param terrain
 * @text 地形タグ
 * @desc 出現する地形タグ一覧
 *       (指定しなかった場合は全地形で出現)
 * @type number[]
 * @min 0
 * @max 7
 * 
 * @param notTerrain
 * @text NG地形タグ
 * @desc 出現しない地形タグ一覧
 * @type number[]
 * @min 0
 * @max 7 
 * 
*/

/*~struct~detailOptionsList:ja
 * @param name
 * @text 名前(管理用)
 * @type string
 * @
 * @param characterImage
 * @text キャラ画像
 * @desc 
 * @type file
 * @dir img/characters
 * @
 * @param charaImgIndex
 * @text インデックス
 * @desc 左上から順に0~7
 * @type number
 * @default 0
 * @min 0
 * @max 7
 * @
 * @param direction
 * @text 向き
 * @type select
 * @default 2
 * @
 * @option 下
 * @value 2
 * @option 左
 * @value 4
 * @option 右
 * @value 6
 * @option 上
 * @value 8
 * @
 * @param spawnRateToRegionOrTerrain
 * @text 出現しやすさ
 * @desc リージョン/地形タグごとの出現しやすさ
 * @type struct<SpawnRateOption>[]
 * 
*/

/*~struct~SpawnRateOption:ja
 * @param region
 * @text リージョン
 * @desc 
 * @default 0
 * @type number
 * @min 0
 * @
 * @param terrain
 * @text 地形タグ
 * @desc 
 * @default 0
 * @type number
 * @min 0
 * @
 * @param frequency
 * @text 出現しやすさ
 * @desc リージョンごとの出現しやすさ
 * @type number
 * @min 0
 * @
 * 
*/

// ================================================================
// Mobリスト
// ================================================================

/*~struct~fieldEnemies:ja
 * @param name
 * @text 名前
 * @desc 管理用
 * @
 * @param eventImage
 * @text 画像
 * @desc 設置するイベントのIDまたは名前
 * @type struct<EventImageData>
 * @
 * @param role
 * @text 特徴
 * @desc イベントの特徴
 *       データ上の処理に違いが出る
 * @type select
 * @default enemy
 * 
 * @option 敵性Mob
 * @value enemy
 * 
 * @option 中立Mob
 * @value neutral
 * 
 * @param troopId
 * @text 敵グループID
 * @type troop
 * 
 * @param requirement
 * @text 条件
 * @desc 出現可能な条件
 * @type struct<eventRequirment>
 * @
 * @param frequency
 * @text 出現しやすさ
 * @desc イベント配置のためのくじの本数
 * @number
 * @default 16
 * @
 * @param eventSight
 * @text 視界
 * @desc Mobの視界(敵性Mobのみ)
 * @string
 * @default 2
 * @
 * @param detailOptions
 * @text 詳細設定
 * @desc 見た目のバリエーション/リージョンごとの出現率など
 * @type struct<detailOptionsList>[]
 * @
*/

/*~struct~EventImageData:ja
 * @param characterImage
 * @text キャラ画像
 * @desc 
 * @type file
 * @dir img/characters
 * @
 * @param charaImgIndex
 * @text インデックス
 * @desc 左上から順に0~7
 * @type number
 * @default 0
 * @min 0
 * @max 7
*/

/*~struct~eventRequirment:ja
 * @param region
 * @text リージョン
 * @desc 出現するリージョン一覧
 *       (指定しなかった場合は全リージョンで出現)
 * @type number[]
 * @min 1
 * @max 255
 * 
 * @param notRegion
 * @text NGリージョン
 * @desc 出現しないリージョン一覧
 * @type number[]
 * @min 1
 * @max 255
 *
 * @param terrain
 * @text 地形タグ
 * @desc 出現する地形タグ一覧
 *       (指定しなかった場合は全地形で出現)
 * @type number[]
 * @min 0
 * @max 7
 * 
 * @param notTerrain
 * @text NG地形タグ
 * @desc 出現しない地形タグ一覧
 * @type number[]
 * @min 0
 * @max 7 
 * 
*/

/*~struct~SpawnRateOption:ja
 * @param region
 * @text リージョン
 * @desc 
 * @default 0
 * @type number
 * @min 0
 * @
 * @param terrain
 * @text 地形タグ
 * @desc 
 * @default 0
 * @type number
 * @min 0
 * @
 * @param frequency
 * @text 出現しやすさ
 * @desc リージョンごとの出現しやすさ
 * @type number
 * @min 0
 * @
 * 
*/

// ================================================================
// 
// ダンジョンの設定
// 
// ================================================================
/*~struct~dungeonEvents:ja
 * @param name
 * @text 名前
 * @desc 管理用
 * @
 * @param id
 * @text ID
 * @desc 設置するイベントのIDまたは名前
 * @type string
 * @
 * @param role
 * @text 特定の役割
 * @desc 入口など必ず生成するイベントの役割を選択
 * @type select
 * @default null
 * @
 * @option なし
 * @value null
 * @
 * @option 入口
 * @value entrance
 * @
 * @option 出口
 * @value exit
 * @
 * @option キャラクター
 * @value character
 * @
 * @param frequency
 * @text 確率
 * @desc マスの通路の数による出現しやすさ(1~5, 1/4/9/16/25で計算)
 *       上から順に通路数が1/2/3/4の出現しやすさ
 * @default [3, 3, 3, 3]
 * @type number[]
 * @max 5
 * @min 1
 * @
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

    // プラグインパラメータ
    // const parameterEventList = JSON.parse(params.DUNGEON_EVENTS_LIST).map((v) => {return JSON.parse(v)});
    // const DUNGEON_EVENTS = parameterEventList.filter((v) => {return v.role === "null" || v.role === "character"})
    // const EVENTS_RATE_LIST = JSON.parse(params.DUNGEON_EVENTS_RATE).map((v) => {return Number(JSON.parse(v))});

    const fieldEventSettingList = JSON.parse(params.FIELD_EVENTS_SETTING)
    // const FIELD_EVENTS_LIST =  JSON.parse(params.FIELD_EVENTS_LIST).map((v) => {return JSON.parse(v)});

    function random(max, min) {
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    }

    //タイル探索関係のパラメーター
    //const parameterResorceTileArray = JSON.parse(params.resorceTileListsGTT);
    //const parameterRegionArray = JSON.parse(params.regionZcoListGTT);

    //プラグインコマンド

    //採取ポイントを作成するコマンド
    PluginManagerEx.registerCommand(script, 'CREATE_FIELD_UNIQUE_EVENT_LIST', args => {
        $gameFarm.createFieldDungeonEvents(args);
    })

    PluginManagerEx.registerCommand(script, 'UPDATE_FIELD_EVENT_LIST', args => {
        $gameFarm.updateFieldEvents(args);
    })

    PluginManagerEx.registerCommand(script, 'FIELD_EVENT_SPAWN_AND_DESPAWN', () => {
        $gameFarm.spawnAndDespawn();
    })

    //イベントが視界内なら可視化するコマンド
    PluginManagerEx.registerCommand(script, 'VISUALIZE_EVENT', args => {
        $gameFarm.findFirmPoint();
    })

    //ダンジョンに入る/階層を進むコマンド
    PluginManagerEx.registerCommand(script, 'PROCEED_DUNGEON', () => {
        $gameFarm.moveNextStage();
    })

    //ダンジョンに入る/階層を進むコマンド
    PluginManagerEx.registerCommand(script, 'BACK_DUNGEON', () => {
        $gameFarm.moveLastStage();
    })

    // ダンジョンを構成するタイルマップを生成
    PluginManagerEx.registerCommand(script, 'CREATE_TILEMAP_DATA', args => {
        const tilesetArray = eval(args.tilesetArray)
        $gameFarm.createDungeonFloorMapTileData(tilesetArray)
    })

    // ダンジョンイベントの設置データを生成
    PluginManagerEx.registerCommand(script, 'CREATE_DUNGEON_EVENTS_SET_DATA', () => {
        $gameFarm.createDungeonEventsSetData();
    })

    // 影の更新
    PluginManagerEx.registerCommand(script, 'UPDATE_SHADOW', () => {
        $gameFarm.updataShadow();
        $gameFarm.updateEventsVisibility();
    })

    //managerへのFarmの追加
        
    window.$gameFarm = {};
    $gameFarm = null;

    const _createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _createGameObjects.call(this);
        $gameFarm = new Game_Farm();
    }

    const _makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _makeSaveContents.call(this);
        contents.gameFarm = $gameFarm;
        return contents;
    }

    const _extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _extractSaveContents.call(this, contents);
        $gameFarm = contents.Farm;
    }

    // fieldEventSettingList
    // activeScope
    // アクティブ範囲はプレイヤーを中心とするactiveScope * 2 + 1四方の範囲
    // spawnRate

    // FIELD_EVENTS_LIST

    const ACTIVE_SCOPE = Number(fieldEventSettingList.activeScope);
    const spawnRate = Number(fieldEventSettingList.spawnRate);

    // console.log(FIELD_EVENTS_LIST)
    // const UNIQUE_EVENT_ROLE = ["dungeon", "ruin"];
    // const FIELD_UNIQUE_EVENTS_LIST = FIELD_EVENTS_LIST.filter((v) => {return UNIQUE_EVENT_ROLE.includes(v.role)});
    // const GENERAL_EVENT_ROLE = ["enemy_character", "neutral_character", "relic"];
    // const FIELD_GENERAL_EVENTS_LIST = FIELD_EVENTS_LIST.filter((v) => {return GENERAL_EVENT_ROLE.includes(v.role)});
    // const DUNGEON_EVENT_ROLE = ["dungeon"];
    // const FIELD_DUNGEON_EVENTS_LIST = FIELD_EVENTS_LIST.filter((v) => {return DUNGEON_EVENT_ROLE.includes(v.role)});
    // const RUIN_EVENT_ROLE = ["ruin"];
    // const FIELD_RUIN_EVENTS_LIST = FIELD_EVENTS_LIST.filter((v) => {return RUIN_EVENT_ROLE.includes(v.role)});
    // console.log(FIELD_RUIN_EVENTS_LIST)

    const LANDMARK_TAG = "landmark";

    const MAX_LEVEL = 5; //生成される最大レベルを５に設定
    const ADD_LEVEL_RATE = 40;

    // ダンジョン同士の距離の最低値
    const DUNGEON_TO_DUNGEON = 3;

    class Game_Farm {
        constructor() {
            this._data = [];
            this._dungeonKeys = {x: 0, y: 0, index: 0, stage: 0};
            this._eventSettingMap = [];
            this._additionalVisibleEventList = [];
            this._shadowData = {};
            this._tempSpawnEventsIdList = [null];
            this._despawnArgumentsList = [];
            // this._fieldUniqueEventList = [null];
            this._fieldEvents = [];
            this._activeScope = ACTIVE_SCOPE;
            this._sightRangeInField = 3;
            this._sightRangeInDungeon = 2;
            this._minX = 0;
            this._minY = 0;
            this._maxX = 0;
            this._maxY = 0;
            this._dungeonTile = {};
            this._shadow = new GTT_Shadow();
            this._fieldDungeons = new GTT_FieldDungeons();
            this._lot = new GTT_Lot();
            this._mapType = "";
            this.setMapType("field");
            this._dataDungeon = new GTT_Data_Dungeon();
            this._dataFieldEvent = new GTT_Data_FieldEvent();
        }
        get minX() {
            return this._minX;
        }
        get maxX() {
            return this._maxX;
        }
        get minY() {
            return this._minY;
        }
        get maxY() {
            return this._maxY;
        }
        // ================================================================
        // 初期設定
        // ================================================================
        setMapRect(param1, param2, param3, param4) {
            this._minX = param1;
            this._minY = param2;
            this._maxX = param3;
            this._maxY = param4;
        }
        setMapType() {
            this._mapType = value;
        }
        // ================================================================
        // 
        // 基礎データ
        // 
        // ================================================================
        // ================================================================
        // プレイヤー
        // ================================================================
        activeScope() {
            return this._activeScope;
        }
        // ================================================================
        // マップ
        // ================================================================
        fieldEvents() {
            return this._fieldEvents;
        }
        isInField() {
            return this._mapType === "field"
        }
        isInDungeon() {
            return this._mapType === "dungeon"
        }
        setMapType(value) {
            this._mapType = value;
        }
        // 
        clearDungeonKeys() {
            this._dungeonKeys = {
                x: 0,
                y: 0,
                index: 0,
                stage: 0
            }
        }
        // 限界座標の設定
        setMapData(param1, param2, param3, param4) {
            this._minX = param1;
            this._minY = param2;
            this._maxX = param3;
            this._maxY = param4;
        }
        // ================================================================
        // スポーン
        // ================================================================
        spawnEvents() {
            return this._spawnEvents;
        }
        clearSpawnEvents() {
            this._spawnEvents = [];
        }
        // ================================================================
        // 数値
        // ================================================================
        randomX() {
            return Math.floor(Math.random() * (this._maxX - this._minX + 1) + this._minX);
        }
        randomY() {
            return Math.floor(Math.random() * (this._maxY - this._minY + 1) + this._minY);
        }
        // イベントをリストにもとづいて設置する
        // updateFieldEvents(args) {
        //     this._fieldUniqueEventSettingDataList = [null];
        //     this._fieldGeneralEventSettingDataList = [null];
        //     if (this.lastPlayerX() || this.lastPlayerY()) {
        //         // 更新
        //         // 範囲内に新しく出現
        //         if (this.isAdditionalActiveAreaExist(args)) {
        //             this._fieldUniqueEventSettingDataList = this.createAdditionalFieldUniqueEventList(args);
        //             this._fieldGeneralEventSettingDataList = this.createAdditionalFieldGeneralEventList(args);
        //         }
        //     } else {
        //         // 最初の設置
        //         this._fieldUniqueEventSettingDataList = this.createInitialFieldUniqueEventsSettingDataList(args);
        //         this._fieldGeneralEventSettingDataList = this.createAdditionalFieldGeneralEventList(args);
        //     }
        //     this.updateLastPlayerXy();
        // }
        // fieldEventsList(index) {
        //     const eventData = FIELD_EVENTS_LIST[index];
        //     return new fieldEvent(eventData);
        // }
        fieldUniqueEventList() {
            return this._fieldUniqueEventList;
        }
        setFieldUniqueEventVisibility(index, boolean) {
            this._fieldUniqueEventList[index][3] = Number(Boolean(boolean));
        }
        // フィールドに設置するイベントの設置データリストを取得
        tempSettingFieldEventDataList() {
            const unique = this._fieldUniqueEventSettingDataList;
            const general = this._fieldGeneralEventSettingDataList;
            const list = [...unique, ...general];
            return list;
        }
        // フィールドに設置するイベントの設置データリストをクリア
        clearSettingFieldEventDataList() {
            this._fieldUniqueEventSettingDataList = [null];
            this._fieldGeneralEventSettingDataList = [null];
            this._tempSpawnEventsIdList = [null];
        }
        // くじ本数リストからくじを引き、本数のインデックスを取得
        // filterされたイベント配列のインデックス番目のイベントのidを取得
        // 取得したidのイベントが全イベントリストの何番目かを取得
        // fieldEventOfSelectedLot(lotNumList, canSpawnList) {
        //     const lotIndex = this._lot.lot(lotNumList);
        //     const selectedId = [...canSpawnList][lotIndex].id;
        //     for (let i = 0; i < FIELD_EVENTS_LIST.length; i++) {
        //         if (selectedId === FIELD_EVENTS_LIST[i].id) {return i}
        //     }
        //     return 0;
        // }
        // イベントデータの一覧
        // allEventsList = function() {
        //     if (this.isInDungeon()) {
        //         // ダンジョンイベントの一覧
        //         return DUNGEON_EVENTS;
        //     } else 
        //     if (this.isInField()) { 
        //         // フィールドイベントの一覧
        //         return FIELD_EVENTS_LIST;
        //     }
        // }
        sightRange() {
            if (this.isInField()) {
                return this._sightRangeInField;
            } else
            if (this.isInDungeon()) {
                return this._sightRangeInDungeon;
            }
        }
        // ================================================================
        // ゲーム開始時の固有イベントの設置
        // ================================================================
        // createFieldDungeonEvents(arg) {
        //     this._fieldUniqueEventList = [];
        //     for (let i = 0; i < arg.eventNum; i++) {
        //         this.addFieldUniqueEventData(FIELD_DUNGEON_EVENTS_LIST, this.notExistAround.bind(this));
        //     }
        //     for (let i = 0; i < arg.ruinEventNum; i++) {
        //         this.addFieldUniqueEventData(FIELD_RUIN_EVENTS_LIST, this.canRuinSpawn.bind(this));
        //     }
        // }
        createFieldDungeonEvents(param1, param2) {
            this._fieldUniqueEventList = [];
            for (let i = 0; i < param1; i++) {
                const eventDataId = $dataFieldEvent.randomSelect(0);
                const additionalEvent = new GTT_FieldEventBase(eventDataId);
                this._fieldEvents.push(additionalEvent);
            }
            for (let i = 0; i < param2; i++) {
                const eventDataId = $dataFieldEvent.randomSelect(1);
                const additionalEvent = new GTT_FieldEventBase(eventDataId);
                this._fieldEvents.push(additionalEvent);
            }
        }
        // GTT_FieldEventBase
        // １つの固有イベントの設置データを作成する
        // addFieldUniqueEventData(eventList, canSpawnSpaceMethod) {
        //     // 設置するイベントのくじ引き
        //     const lists = this.createLotNumListOfFieldEvents(eventList);
        //     const index = this.fieldEventOfSelectedLot(...lists);
        //     const eventSetting = FIELD_EVENTS_LIST[index];
        //     // 座標
        //     let x, y;
        //     for (let isField = false; isField === false;) {
        //         x = Math.floor(Math.random() * (this._maxX - this._minX + 1) + this._minX);
        //         y = Math.floor(Math.random() * (this._maxY - this._minY + 1) + this._minY);
        //         // そのマスが何らかのイベントのスポーン可能条件を満たしているかの判定
        //         // 道の上にイベントがスポーンしないようにするためのの処理

        //         const onField = $gameMap.regionId(x, y) > 0; //通行可能領域全てにリージョンを設定しているので、リージョンIDが>0だと通行可能領域
        //         const canSpawnArea = this.canSpawnArea(x, y, eventSetting); // そのマスがイベントのスポーン条件を満たしているかどうか
        //         // ダンジョン系イベント同士が近すぎないように調整
        //         isField = onField && canSpawnArea && canSpawnSpaceMethod(x, y);
        //     }
        //     const data = this.createFieldUniqueEventSettingData(x, y, index);
        //     this._fieldUniqueEventList.push(data);
        // }
        addFieldUniqueEventData() {
            // 設置するイベントのくじ引き
            const lists = this.createLotNumListOfFieldEvents(eventList);
            const index = this.fieldEventOfSelectedLot(...lists);
            // 座標
            const spot = this.spawnSpot();
            const data = this.createFieldUniqueEventSettingData(spot[0], spot[1], index);
            this._fieldUniqueEventList.push(data);
        }
        // ================================================================
        // ゲーム開始時のダンジョン系イベントの設置
        // ================================================================
        // ダンジョンの周りに何もないか
        notExistAround(x, y) {
            // 範囲
            const width = DUNGEON_TO_DUNGEON;
            const startX = Math.max(x - width, this._minX);
            const startY = Math.max(y - width, this._minY);
            const endX = Math.min(x + width, this._maxX);
            const endY = Math.min(y +  width, this._maxY);
            for (let xLoop = 0; startX + xLoop < endX; xLoop++) {
                for (let yLoop = 0; startY + yLoop < endY; yLoop++) {
                    // if(this._fieldUniqueEventList.some((v) => {return v[0] === startX + xLoop && v[0] === startY + yLoop})) {
                    //     return false;
                    // }
                    if(this._fieldEvents.some((v) => {return v[0] === startX + xLoop && v[0] === startY + yLoop})) {
                        return false;
                    }
                }
            }
            return true;
        }
        // ================================================================
        // ゲーム開始時の廃墟(ファームポイント)イベントの設置
        // ================================================================
        // 家が設置できるか
        canRuinSpawn(x, y) {
            // 家が設置できるか
            // 同じ座標にないか
            const onEmpty = this._fieldEvents.every((v) => {return v[0] != x && v[1] != y})
            // 家はy軸基準で重なっていなければ設置できることとする
            const upEmpty = y - 1 > this._minY ? this._fieldEvents.every((v) => {return v[0] != x && v[1] != y - 1}) : false;
            const downEmpty = y + 1 < this._maxY ? this._fieldEvents.every((v) => {return v[0] != x && v[1] != y + 1}) && $gameMap.regionId(x, y + 1) > 0 : false;
            return onEmpty && upEmpty && downEmpty;
        }
        // ================================================================
        // ゲーム開始時の固有イベント設置のための諸処理
        // ================================================================
        // １つの固有イベントの設置データを作成する
        // 座標を決めてから設置するイベントを決定するパターン
        // createFieldDungeonEvent() {
        //     // 座標
        //     let x, y;
        //     for (let isField = false; isField === false;) {
        //         x = Math.floor(Math.random() * (this._maxX - this._minX + 1) + this._minX);
        //         y = Math.floor(Math.random() * (this._maxY - this._minY + 1) + this._minY);
        //         // そのマスが何らかのイベントのスポーン可能条件を満たしているかの判定
        //         // 道の上にイベントがスポーンしないようにするためのの処理

        //         //通行可能領域全てにリージョンを設定しているので、リージョンIDが>0だと通行可能領域
        //         if ($gameMap.regionId(x, y) > 0 && this.isSpawnableEventExist(x, y, FIELD_UNIQUE_EVENTS_LIST)) {
        //             if (this.canDungeonSpawn(x, y)) { // ダンジョン系イベント同士が近すぎないように調整
        //                 isField = true;
        //             }
        //         };
        //     }
        //     // 設置するイベントのくじ引き
        //     const lists = this.createLotNumListOfSpawnableFieldEvents(x, y, FIELD_UNIQUE_EVENTS_LIST);
        //     const index = this.fieldEventOfSelectedLot(...lists);
        //     const data = this.createFieldUniqueEventSettingData(x, y, index);
        //     return data;
        // }
        // 固有イベントの設置データ
        // createFieldUniqueEventSettingData(x, y, index) {
        //     return [x, y, index, 0]; // [イベントの位置するx座標,  イベントの位置するy座標, フィールドイベントのデータのインデックス, 既に発見したか]
        // }
        // あるマスが何らかのイベントのスポーン可能条件を満たしているかの判定
        // isSpawnableEventExist(x, y, list) {
        //     const onRegion = $gameMap.regionId(x, y);
        //     const onTerrain = $gameMap.terrainTag(x, y);
        //     const canSpawnList = [...list].some((v) => {return this.canSpawnToRegion(onRegion, v) && this.canSpawnToTerrain(onTerrain, v)});

        //     return canSpawnList;
        // }
        // イベントを選ぶくじ本数リスト作成
        // ある座標にスポーン可能なイベントのもののみ抽出
        createLotNumListOfFieldEvents(list) {
            const lotNumList = [...list].map((v) => {return Number(v.frequency)});
            return [lotNumList, list];
        }
        // イベントを選ぶくじ本数リスト作成
        // ある座標にスポーン可能なイベントのもののみ抽出
        createLotNumListOfSpawnableFieldEvents(x, y, list) {
            // const lotNumList = [...list].map((v) => {return Number(v.frequency)});
            const onRegion = $gameMap.regionId(x, y);
            const onTerrain = $gameMap.terrainTag(x, y);
            const canSpawnList = [...list].filter((v) => {return this.canSpawnToRegion(onRegion, v) && this.canSpawnToTerrain(onTerrain, v)});
            const lotNumList = canSpawnList.map((v) => {return this.getLotNum(onRegion, onTerrain, v) ** 2});
            return [lotNumList, canSpawnList];
        }
        // // スポーンできるか(ある座標に)
        // canSpawnArea(x, y, eventSetteing) {
        //     const onRegion = $gameMap.regionId(x, y);
        //     const onTerrain = $gameMap.terrainTag(x, y);
        //     return this.canSpawnToRegion(onRegion, eventSetteing) && this.canSpawnToTerrain(onTerrain, eventSetteing)
        // }
        // // スポーンできるか(リージョンによって)
        // canSpawnToRegion(onRegion, eventSetteing) {
        //     if (!eventSetteing.requirement) { //そもそも [...list][i].requirement.regionが定義されてない場合はもうスポーンできる
        //         return true
        //     } else {
        //         const eventData = new fieldEvent(eventSetteing)
        //         const requirementList = eventData.requirement();
        //         const regionList = requirementList.region; //形態が "" "[]" "["a", "b", "c"]"なので JSON.parse だとエラーを吐いてしまう
        //         const notRegionList = requirementList.notRegion; // "" が [] or {} でないため
        //         // 出現リージョンリストがあるか or 出現リージョンリスト内にonRegionがあるか
        //         if (!regionList || !regionList.length || regionList.includes(onRegion)) { //""内に要素がある場合は、ここで要素をNumberに変換する
        //             if(!notRegionList || !notRegionList.length || !notRegionList.includes(onRegion)) { // 非出現リージョンリスト内にないあるいはリストがないか
        //                 return true
        //             }
        //         }
        //     }
        //     return false;
        // }
        // // スポーンできるか(地形タグによって)
        // canSpawnToTerrain(onTerrain, eventSetteing) {
        //     if (!eventSetteing.requirement) { //そもそも [...list][i].requirement.terrainが定義されてない場合はもうスポーンできる
        //         return true
        //     } else {
        //         const eventData = new fieldEvent(eventSetteing)
        //         const requirementList = eventData.requirement();
        //         const terrainList = requirementList.terrain; //形態が "" "[]" "["a", "b", "c"]"なので JSON.parse だとエラーを吐いてしまう
        //         const notTerrainList = requirementList.notTerrain; // "" が [] or {} でないため
        //         // 出現地形タグリストがあるか or 出現地形タグリスト内にonRegionがあるか
        //         if (!terrainList || !terrainList.length || terrainList.includes(onTerrain)) { //""内に要素がある場合は、ここで要素をNumberに変換する
        //             if(!notTerrainList || !notTerrainList.length || !notTerrainList.includes(onTerrain)) { // 非出現地形タグリスト内にないあるいはリストがないか
        //                 return true
        //             }
        //         }
        //     }
        //     return false;
        // }
        // くじの本数の取得
        // detailOptions
        // spawnRateToRegionOrTerrain
        // getLotNum(onRegion, onTerrain, eventDataArg) {
        //     const eventData = new fieldEvent(eventDataArg);
        //     const detailSpawnRates = eventData.detailOptions();
        //     // 今いるマスのリージョンあるいは地形タグに関する最初に見つかるくじの本数を取得.spawnRateToRegionOrTerrain
        //     const matchObj = detailSpawnRates.find((v) => {return v.spawnRateToRegionOrTerrain.region === onRegion || v.spawnRateToRegionOrTerrain.terrain === onTerrain});
        //     const lotNum = matchObj ? matchObj.spawnRateToRegionOrTerrain.frequency : eventData.frequency;
        //     return lotNum;
        // }
        // 設置データの作成
        createInitialFieldUniqueEventsSettingDataList() {
            // スポーン判定を行う範囲の原点
            const originX = Math.max($gamePlayer.x - this._activeScope, this._minX);
            const originY = Math.max($gamePlayer.y - this._activeScope, this._minY);
            const endX = Math.min($gamePlayer.x + this._activeScope, this._maxX);
            const endY = Math.min($gamePlayer.y + this._activeScope, this._maxY);
            // 幅/高さ
            const width = endX - originX;
            const height = endY - originY;
            // データ作成
            const list = [];
            for (let dx = 0; dx < width; dx++) {
                for (let dy = 0; dy < height; dy++) {
                    const x = originX + dx;
                    const y = originY + dy;
                    const eventData = this.fieldUniqueEventData(x, y);
                    if(eventData) {list.push(eventData)}
                }
            }
            return list;
        }
        // ================================================================
        // マスを移動するごとにイベント情報を更新する処理
        // ================================================================
        // 新しくアクティブ範囲に入るエリアがあるかどうか(端っこだとアクティブエリアは増えない)
        // isAdditionalActiveAreaExist() {
        //     // 直前のマスとの差
        //     const signMarginalX = Math.sign($gamePlayer.x - this.lastPlayerX());
        //     const signMarginalY = Math.sign($gamePlayer.y - this.lastPlayerY());
        //     // 入るエリアがあるかどうか
        //     let additionalArea = null;
        //     let list = [null];
        //     if (signMarginalX) { //xベクトルで移動している場合
        //         additionalArea = $gamePlayer.x + this._activeScope * signMarginalX;
        //         list = [additionalArea >= this._minX, additionalArea <= this._maxX];
        //     } else 
        //     if (signMarginalY) { //yベクトルで移動している場合
        //         additionalArea = $gamePlayer.y + this._activeScope * signMarginalY;
        //         list = [additionalArea >= this._minY, additionalArea <= this._maxY];
        //     }
        //     return list.every((v) => v);
        // }
        // アクティブ範囲内への固有イベントの設置
        // createAdditionalFieldUniqueEventList() {
        //     const xyd = this.additionalActiveAreaOriginXy();
        //     // 新たにアクティブ範囲に入るマス目群の原点
        //     const OriginX = xyd[0];
        //     const OriginY = xyd[1];
        //     // 新たにアクティブ範囲に入るマス目群が原点からどの向きに伸びているかを代入
        //     const directionX = xyd[2]; //1/0/0/-1
        //     const directionY = xyd[3]; //0/1/-1/0
        //     // 一般イベントが出現するか1マスずつ検証していく
        //     const list = [];
        //     // ((範囲×(現在のx座標-一歩前のx座標)の絶対値)あるいは1か、の大きい方)とすることで1マス分かactiveScopeの2択になり
        //     // しかもxとyの値が互い違いになる xがactiveScopeならyは1
        //     const width = Math.max(Math.abs((this._activeScope * 2 + 1) * directionY), 1);
        //     const height = Math.max(Math.abs((this._activeScope * 2 + 1) * directionX), 1);
        //     for (let absDX = 0; absDX < width ;absDX++) {
        //         for (let absDY = 0; absDY < height ;absDY++) {
        //             // 対象のマスを取得
        //             const x = OriginX + absDX;// * directionX;
        //             const y = OriginY + absDY;// * directionY;
        //             // 固有イベントがある場合
        //             const data = this.fieldUniqueEventData(x, y);
        //             if (data) {list.push(data);}
        //         }
        //     }
        //     return list;
        // }
        // 新しくアクティブ範囲に入るエリアの原点の座標を取得
        // additionalActiveAreaOriginXy() {
        //     // 符号
        //     const signMarginalX = Math.sign($gamePlayer.x - this.lastPlayerX());
        //     const signMarginalY = Math.sign($gamePlayer.y - this.lastPlayerY());
        //     // 原点の座標を計算
        //     const dx = signMarginalX > 0 ? this._activeScope : - this._activeScope;
        //     const dy = signMarginalY > 0 ? this._activeScope : - this._activeScope;
        //     const OriginX = Math.max(Math.min($gamePlayer.x + dx, this._maxX), this._minX);
        //     const OriginY = Math.max(Math.min($gamePlayer.y + dy, this._maxY), this._minY);
        //     return [OriginX, OriginY, signMarginalX, signMarginalY];
        // }
        // // アクティブ範囲内への一般イベントの設置
        // createAdditionalFieldGeneralEventList() {
        //     // args minXy:[設置可能範囲の最小x座標, 設置可能範囲の最小y座標], maxXy:[設置可能範囲の最大x座標, 設置可能範囲の最大y座標]
        //     // スポーン判定を行う範囲の原点
        //     const originX = Math.max($gamePlayer.x - this._activeScope, this._minX);
        //     const originY = Math.max($gamePlayer.y - this._activeScope, this._minY);
        //     const endX = Math.min($gamePlayer.x + this._activeScope, this._maxX);
        //     const endY = Math.min($gamePlayer.y + this._activeScope, this._maxY);
        //     // 幅/高さ
        //     const width = endX - originX;
        //     const height = endY - originY;
        //     // スポーン判定
        //     const list = [];
        //     for(let dx = 0; dx < width; dx++) {
        //         for(let dy = 0; dy < height; dy++) {
        //             const x = originX + dx;
        //             const y = originY + dy;
        //             // スポーンするか(確率)
        //             if(this.isSpawn()) {
        //                 // 視界範囲外か
        //                 if (Math.abs($gamePlayer.x - x) > this.playerSight() + 1 || Math.abs($gamePlayer.y - y) > this.playerSight() + 1) {
        //                     // その位置に他の固有イベント、一般イベントがないかどうか
        //                     if (!this.fieldUniqueEventData(x, y) && $gameMap.eventIdXy(x, y) < 1) {
        //                         // スポーンできるか
        //                         if ($gameMap.regionId(x, y) > 0) {
        //                             if (this.isSpawnableEventExist(x, y, FIELD_GENERAL_EVENTS_LIST)) {
        //                                 const data = this.createAdditionalFieldGeneralEventData(x, y);
        //                                 list.push(data);
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     return list;
        // }
        // 最後に到達したマスの更新
        updateLastPlayerXy() {
            this._lastPlayerX = $gamePlayer.x;
            this._lastPlayerY = $gamePlayer.y;
        }
        // 最後に到達したマスのx座標
        lastPlayerX() {
            return this._lastPlayerX;
        }
        // 最後に到達したマスのy座標
        lastPlayerY() {
            return this._lastPlayerY;
        }
        // // スポーンするか(確率)
        // isSpawn() {
        //     return Math.random() * 1000 < spawnRate;
        // }
        // 新たに出現する一般イベントのデータを作成
        // createAdditionalFieldGeneralEventData(x, y) {
        //     const lotNumList = this.createLotNumListOfSpawnableFieldEvents(x, y, FIELD_GENERAL_EVENTS_LIST)[0];
        //     const index = this._lot.lot(lotNumList);
        //     const eventId = FIELD_GENERAL_EVENTS_LIST[index].id;
        //     return [x, y, eventId, 0];
        // }
        // ある座標の固有イベントの検索
        // fieldUniqueEventData(x, y) {
        //     const eventData = this.fieldUniqueEventList().find((v) => {return v[0] === x && v[1] === y});
        //     if(eventData) {
        //         const index = eventData[2];
        //         const eventId = FIELD_EVENTS_LIST[index].id;
        //         return [eventData[0], eventData[1], eventId, eventData[3]];
        //     }
        //     return null;
        // }
        // ================================================================
        // アクティブ範囲外の固有イベントデスポーン
        // ================================================================
        // 新しくアクティブ範囲外に出るエリアがあるかどうか
        isAdditionalDeactiveAreaExist() {
            // 直前のマスとの差
            const signMarginalX = Math.sign($gamePlayer.x - this.lastPlayerX());
            const signMarginalY = Math.sign($gamePlayer.y - this.lastPlayerY());
            // 出るエリアがあるかどうか
            let additionalArea = null;
            let list = [null];
            if (signMarginalX) { //xベクトルで移動している場合
                additionalArea = $gamePlayer.x + (this._activeScope + 1) * (-signMarginalX);
                list = [additionalArea >= this._minX, additionalArea <= this._maxX];
            } else 
            if (signMarginalY) { //yベクトルで移動している場合
                additionalArea = $gamePlayer.y + (this._activeScope + 1) * (-signMarginalY);
                list = [additionalArea >= this._minY, additionalArea <= this._maxY];
            }
            return list.every((v) => v);
        }
        // ================================================================
        // スポーン/デスポーン
        // ================================================================
        spawnAndDespawn = function() {
            this.eventsDespawn();
            this.eventSpawn();
            this.clearSettingFieldEventDataList();
        }
        // ================================================================
        // 
        // フィールドイベント
        // 
        // ================================================================
        // ================================================================
        // データ
        // ================================================================
        fieldEventXy(param1, param2) {
            return this.fieldEvents().find((event) => {
                return event.x === param1 && event.y === param2
            })
        }
        // ================================================================
        // 上位処理
        // ================================================================
        // 範囲内のフィールドイベントの検索
        fieldEventsInScope(param1, param2, param3, param4) {
            const list = [];
            for (let absDX = 0; absDX < param3 ;absDX++) {
                for (let absDY = 0; absDY < param4 ;absDY++) {
                    // 対象のマスを取得
                    const x = param1 + absDX;// * directionX;
                    const y = param2 + absDY;// * directionY;
                    // 固有イベントがある場合
                    const data = this.fieldEventDataXy(x, y);
                    if (data) {list.push(data)};
                }
            }
            return list;
        }
        // ある座標のフィールドイベントの検索
        fieldEventDataXy(x, y) {
            return this.fieldEvents().find((v) => {return v.x === x && v._y === y});
        }
        // ================================================================
        // ゲーム開始時のフィールドイベントを生成
        // ================================================================
        // フィールドダンジョンイベント
        createFieldDungeonEvents(param1, param2) {
            this._fieldEvents = [];
            // ダンジョン
            for (let i = 0; i < param1; i++) {
                const eventDataId = $dataFieldEvent.randomSelect(0);
                const id = this._fieldEvents.length;
                this._fieldEvents[id] = new GTT_FieldEventBase(eventDataId, id);
                // this._fieldEvents.push(additionalEvent);
            }
            // 廃屋
            for (let i = 0; i < param2; i++) {
                const eventDataId = $dataFieldEvent.randomSelect(1);
                const id = this._fieldEvents.length;
                this._fieldEvents[id] = new GTT_FieldEventBase(eventDataId, id);
                // this._fieldEvents.push(additionalEvent);
            }
        }
        // ================================================================
        // 
        // ゲーム開始時のフィールドイベントの設置
        // 
        // ================================================================
        // 新しくアクティブ範囲内に入るフィールドイベント
        addSpawnFieldEventsAtStart() {
            this._spawnEvents = [];
            const rect = this.activeRect();
            const events = this.fieldEventsInScope(rect[0], rect[1], rect[2], rect[3]);
            this._spawnEvents.push(...events);
        }
        // ================================================================
        // 
        // マスを移動するごとにイベント情報を更新する処理
        // 
        // ================================================================
        // イベントをリストにもとづいて設置する
        updateFieldEvents() {
            // 更新
            this._spawnEvents = [];
            // 範囲内に新しく出現
            if (this.isAdditionalActiveAreaExist()) { // 新しくアクティブ範囲に入るエリアがあるかどうか
                // フィールドイベント
                this.addSpawnFieldEvents();
                // 一時イベント
                this.addSpawnTempEvents();
            }
            console.log(this._spawnEvents)
            // 最後に到達した座標を更新
            this.updateLastPlayerXy();
        }
        // 新しくアクティブ範囲に入るエリアがあるかどうか(端っこだとアクティブエリアは増えない)
        isAdditionalActiveAreaExist() {
            // 直前のマスとの差
            const signMarginalX = Math.sign($gamePlayer.x - this.lastPlayerX());
            const signMarginalY = Math.sign($gamePlayer.y - this.lastPlayerY());
            // 入るエリアがあるかどうか
            if (signMarginalX) { //xベクトルで移動している場合
                const additionalArea = $gamePlayer.x + this._activeScope * signMarginalX;
                return additionalArea >= this._minX && additionalArea <= this._maxX;
            } else 
            if (signMarginalY) { //yベクトルで移動している場合
                const additionalArea = $gamePlayer.y + this._activeScope * signMarginalY;
                return additionalArea >= this._minY && additionalArea <= this._maxY;
            }
        }
        // ================================================================
        // フィールドイベント
        // ================================================================
        // 新しくアクティブ範囲内に入るフィールドイベントをスポーンイベントリストに追加
        addSpawnFieldEvents() {
            const events = this.fieldEventsInAdditionalArea();
            this._spawnEvents.push(...events);
        }
        // 新しくアクティブ範囲内に入るフィールドイベント
        fieldEventsInAdditionalArea() {
            const xyd = this.additionalActiveAreaOriginXy();
            // 新たにアクティブ範囲に入るマス目群の原点
            const OriginX = xyd[0];
            const OriginY = xyd[1];
            // 新たにアクティブ範囲に入るマス目群が原点からどの向きに伸びているかを代入
            const directionX = xyd[2]; //1/0/0/-1
            const directionY = xyd[3]; //0/1/-1/0
            // ((範囲×(現在のx座標-一歩前のx座標)の絶対値)あるいは1か、の大きい方)とすることで1マス分かactiveScopeの2択になり
            // しかもxとyの値が互い違いになる xがactiveScopeならyは1
            const width = Math.max(Math.abs((this._activeScope * 2 + 1) * directionY), 1);
            const height = Math.max(Math.abs((this._activeScope * 2 + 1) * directionX), 1);
            return this.fieldEventsInScope(OriginX, OriginY, width, height)
        }
        // 新しくアクティブ範囲に入るエリアの原点の座標を取得
        additionalActiveAreaOriginXy() {
            // 符号
            const signMarginalX = Math.sign($gamePlayer.x - this.lastPlayerX());
            const signMarginalY = Math.sign($gamePlayer.y - this.lastPlayerY());
            // 原点の座標を計算
            const dx = signMarginalX > 0 ? this._activeScope : - this._activeScope;
            const dy = signMarginalY > 0 ? this._activeScope : - this._activeScope;
            const OriginX = Math.max(Math.min($gamePlayer.x + dx, this._maxX), this._minX);
            const OriginY = Math.max(Math.min($gamePlayer.y + dy, this._maxY), this._minY);
            return [OriginX, OriginY, signMarginalX, signMarginalY];
        }
        // ================================================================
        // 一時イベント
        // ================================================================
        // 新しくスポーンする一時イベント
        addSpawnTempEvents() {
            const events = this.tempEventsSpawn();
            this._spawnEvents.push(...events);
        }
        // アクティブ範囲内への一般イベントの設置
        tempEventsSpawn() {
            // アクティブ範囲
            const rect = this.activeRect();
            // スポーン判定
            const list = [];
            for(let dx = 0; dx < rect[2]; dx++) {
                for(let dy = 0; dy < rect[3]; dy++) {
                    const x = rect[0] + dx;
                    const y = rect[1] + dy;
                    // スポーンするか(確率)
                    if(this.isSpawn() && this.canTempEventSpawn(x, y)) {
                        const data = {_x: x, _y: y, _dataId: 9, _found: false};
                        list.push(data);
                    }
                }
            }
            return list;
        }
        // アクティブ範囲
        activeRect() {
            // スポーン判定を行う範囲の原点
            const originX = Math.max($gamePlayer.x - this._activeScope, this._minX);
            const originY = Math.max($gamePlayer.y - this._activeScope, this._minY);
            const endX = Math.min($gamePlayer.x + this._activeScope, this._maxX);
            const endY = Math.min($gamePlayer.y + this._activeScope, this._maxY);
            // 幅/高さ
            const width = endX - originX;
            const height = endY - originY;
            // 原点と幅/高さを返す
            return [originX, originY, width, height];
        }
        // スポーンするか(確率)
        isSpawn() {
            return Math.random() < 0.01;
        }
        canTempEventSpawn(x, y) {
            // 視界範囲外か
            if (Math.abs($gamePlayer.x - x) > this.sightRange() + 1 || Math.abs($gamePlayer.y - y) > this.sightRange() + 1) {
                // その位置に他の固有イベント、一般イベントがないかどうか
                if (!this.fieldEventDataXy(x, y) && !$gameMap.eventIdXy(x, y)) {
                    // スポーンできるか
                    if ($gameMap.regionId(x, y) > 0) {
                        if (this.isSpawnableEventExist(x, y)) {
                            return true
                        }
                    }
                }
            }
        }
        isSpawnableEventExist(x, y) {
            // const onRegion = $gameMap.regionId(x, y);
            // const onTerrain = $gameMap.terrainTag(x, y);
            // const events = $dataFieldEvent.tempEventData();

            // return events.some(() => {return this.canSpawnToRegion(onRegion) && this.canSpawnToTerrain(onTerrain)});
            return true;
        }
        // ================================================================
        // スポーン/デスポーンの処理
        // ================================================================
        // 既にあるイベントで足りるかどうか
        needEventsNum() {
            const setEventsNum = this.spawnEvents().length;
            const deactiveEventsNum = $gameMap.deactiveEventsNum();
            const needEventsNum = Math.max(setEventsNum - deactiveEventsNum, 0);
            return needEventsNum;
        }
        // ================================================================
        // 
        // ダンジョン
        // 
        // ================================================================
        // ================================================================
        // ダンジョンデータの管理
        // ================================================================
        dungeons() {
            return this._fieldDungeons.dungeons();
        }
        dungeon(value) { // value > 0
            return this._fieldDungeons.dungeon(value);
        }
        currentDungeon() {
            return this.dungeon(this._dungeonKeys.index);
        }
        currentStage() {
            return this._dungeonKeys.stage;
        }
        // currentDungeonMap() {
        //     const stage = this._dungeonKeys.stage - 1;
        //     return this.currentDungeon().stageMap(stage);
        // }
        // currentExploredMap() {
        //     if (this.isInDungeon()) {
        //         return this.currentDungeon().currentExploredMap();
        //     }
        //     return ;
        // }
        // currentDungeonSize() {
        //     const stage = this._dungeonKeys.stage - 1;
        //     return this.currentDungeon().size(stage);
        // }
        setDungeonKey(x, y) {
            this._dungeonKeys.x = x;
            this._dungeonKeys.y = y;
        }
        isDungeonExist() {
            return this._fieldDungeons.isDungeonExist(this._dungeonKeys.x, this._dungeonKeys.y);
        }
        setDungeonIndex() {
            this._dungeonKeys.index = this._fieldDungeons.dungeons().findIndex((dungeon) => {
                return dungeon && dungeon._x === this._dungeonKeys.x && dungeon._y === this._dungeonKeys.y;
            });
        }
        // ================================================================
        // ダンジョン進行
        // ================================================================
        //ダンジョンに入る＆ダンジョンの階層を進むときの処理
        moveNextStage() {
            // ダンジョンキーの追加
            if (this._dungeonKeys.stage === 0) {
                // this.setMapType("dungeon");
                this.setMapType("field");
                this.setDungeonKey($gamePlayer.x, $gamePlayer.y);
                // キーに設定した座標のダンジョンが存在していない場合作成
                if (!this.isDungeonExist()) {
                    this.createNewDungeon();
                }
                // ダンジョンデータのインデックスを設定
                this.setDungeonIndex();
            }
            this._dungeonKeys.stage += 1;
        }
        //ダンジョンの階層を戻るときの処理
        moveLastStage() {
            this._dungeonKeys.stage -= 1; //ダンジョンの階層を戻る
            if (this.dungeonStage() === 0) {
                this.setMapType("field");
                this.clearDungeonKeys();
            }
        }
        // ダンジョンデータを追加する
        createNewDungeon() {
            this._fieldDungeons.createNewMaze(this._dungeonKeys.x, this._dungeonKeys.y);
        }
        createStage() {
            this._fieldDungeons.createStage(this._dungeonKeys);
        }
        currentStage() {
            return this._fieldDungeons._dungeon;
        }
        // ================================================================
        // ダンジョンイベント
        // ================================================================
        dungeonEventsNum() {
            const stage = this._dungeonKeys.stage - 1;
            return this.currentDungeon().eventsNum(stage);
        }
        setDungeonEvents() {
            const stage = this._dungeonKeys.stage - 1;
            return this.currentDungeon().setEvents(stage);
        }
        // ================================================================
        // ダンジョンタイル
        // ================================================================
        setDungeonTile(tileX, y) {
            this._tileX = tileX;
            this._tileY = y;
        }
        dungeonTile() {
            const stage = this._dungeonKeys.stage - 1;
            return this.currentDungeon().dungeonTileData(this._tileX, this._tileY, stage);
        }
        // ================================================================
        // 敵性キャラクターの行動                               
        // ================================================================
        enemyTurn(args) {
            for (let i = 0; i < $gameMap.events().length; i++) {
                $gameMap.event(i+1).enemyAction(args);
            }
        }
        // ================================================================
        // イベントの可視性を更新
        // ================================================================
        shadow() {
            return this._shadow;
        }
        // tempEventsVisibilityArgumentsList() {
        //     return this._tempEventsVisibilityArgumentsList;
        // }
        // tempEventsVisibilityArgument(value) {
        //     return this.tempEventsVisibilityArgumentsList()[value];
        // }
        // updateVisibilityOfEachFieldUniqueEvent(x, y) {
        //     for (let i = 0; i < this.fieldUniqueEventList().length; i++) {
        //         const eventData = this.fieldUniqueEventList()[i];
        //         if (eventData[0] === x && eventData[1] === y) {
        //             this.setFieldUniqueEventVisibility(i, true);
        //         }
        //     }
        // }
        // isFieldUniqueEvent(tag) {
        //     return [...FIELD_UNIQUE_EVENTS_LIST].some((v) => {return v.id === tag});
        // }
    }

    class GTT_Lot {
        constructor() {
            this._lotNumList = [];
            this._rateAccumulation = [];
        }
        lot(lotNumList) {
            this._lotNumList = lotNumList;
            this.createRateAcumuration();
            return this.lotProcess();
        }
        createRateAcumuration() {
            const initArray = this._lotNumList.map(() => {return 0});
            this._rateAccumulation = this._lotNumList.reduce((total, current, index) => {
                total[index] = total[Math.max(index - 1, 0)] + current;
                return total;
            }, initArray);
        }
        // くじをひく処理
        lotProcess() {
            const rateMax = this._rateAccumulation[this._rateAccumulation.length - 1];
            const randomResult = Math.random() * rateMax;
            return this._rateAccumulation.findIndex((v) => {
                return randomResult < v;
            });
        }
    }


    // // ================================================================
    // //
    // // 採取                 
    // //         
    // // ================================================================

    // //採取くじ配列の生成
    // //resorceTileListGTT : parameterResorceTileArray
    // //tileArrayGTT : const paramKeyBase = JSON.parse(parameterResorceTileArray[]) const paramTileArray = paramKeyBase["tileArrayGTT"] paramTileArray
    // //resorceListArray : const paramKeyBase = JSON.parse(parameterResorceTileArray[]) const paramResorceArray = paramKeyBase["resorceListArray"]
    // //
    // //
    // //
    // //const paramKeyBase = JSON.parse(parameterResorceTileArray[0]);
    // //const paramResorceArray = paramKeyBase["tileArrayGTT"];
    // //const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);
    // //
    // //const resorceKeyBase = JSON.parse(paramResorceLotObj[0]);
    // //const paramResorceId = resorceKeyBase["resorceGTT"];
    // //const paramResorceLotNum = resorceKeyBase["lotNumGTT"];

    // //指定座標に対応した資源くじ配列を取得
    // Game_Farm.prototype.farmLot = function(x, y) {    
    //     for (let layerIdGTT = 1; layerIdGTT <= 4; layerIdGTT++){
    //         (this.tileTypeGTT($gameMap.tileId(x, y, layerIdGTT)) > 0) ? 
    //             this.addLotArrayAll(
    //                 this.tileTypeGTT($gameMap.tileId(x, y, layerIdGTT))
    //         ) : console.log("aaa")  
    //         }
    //     return this._data || 0;
    // }

    // //資源タイルリストのn番目の資源タイルリスト(オブジェクト)を取得
    // Game_Farm.prototype.resorceTileList = function(param) {
    //     const paramKeyBase = JSON.parse(parameterResorceTileArray[param - 1]);
    //     const paramTileArray = paramKeyBase["tileArrayGTT"]

    //     return paramTileArray;
    // }

    // //あるタイルIDが属している資源タイルID群(タイルタイプ)を取得
    // Game_Farm.prototype.tileTypeGTT = function(param) {
    //     let tileTypeGtt = 0;
    // for (let loopTileType = 1, foundTileType = false; loopTileType <= parameterResorceTileArray.length && foundTileType === false; loopTileType++){
    //         tileTypeGtt = loopTileType;
    //         foundTileType = this.resorceTileList(tileTypeGtt).includes(param);
    //     }
    //     if (this.resorceTileList(tileTypeGtt).includes(param) === true) {
    //         return tileTypeGtt;
    //     } else {return -1}
    // };

    // //ある資源タイルID群に対応する資源リストを全部採取くじ配列に追加する処理(param:タイル群)
    // Game_Farm.prototype.addLotArrayAll = function(param) {
    //     const paramKeyBase = JSON.parse(parameterResorceTileArray[param - 1]);
    //     const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);

    //     for (let loopAddLotArrayAll = 1; loopAddLotArrayAll <= paramResorceLotObj.length; loopAddLotArrayAll++) {
    //         this.addLotArray(param, loopAddLotArrayAll)
    //     }
    // }

    // //資源タイルID群n番目の資源リストm番目を採取くじ配列に追加する処理
    // Game_Farm.prototype.addLotArray = function(param1, param2) {
    //     const paramKeyBase = JSON.parse(parameterResorceTileArray[param1 - 1]);
    //     const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);

    //     const resorceKeyBase = JSON.parse(paramResorceLotObj[param2 - 1]);
    //     const paramResorceId = Number(resorceKeyBase["resorceGTT"]);
    //     const paramResorceLotNum = Number(resorceKeyBase["lotNumGTT"]);

    //     this.addLot(paramResorceId, paramResorceLotNum);
    // }

    // //採取くじ配列に資源くじを追加する処理(param1:アイテムID, param2:くじの本数)
    // Game_Farm.prototype.addLot = function(param1, param2) {
    //     for (let loopAddLot = 1; loopAddLot <= param2; loopAddLot++) {
    //         this.array().push(param1)
    //     }
    // }

    // //z座標関係//
    // //z座標関係//

    // //リージョンのz座標を取得
    // Game_Farm.prototype.regionZco = function(x, y) {
    //     const regionId = $gameMap.regionId(x, y);
    //     let setZco = 0;

    //     for (let i = 1, foundZco = false; i <= parameterRegionArray.length && foundZco === false; i++) {
    //         setZco = i;
    //         foundZco = this.ArrayRegionZco(setZco).includes(regionId)
    //     }
    //     if ( this.ArrayRegionZco(setZco).includes(regionId) ) { return this.zcoRegionZco(setZco) } else { return - 1 };
    // }

    // //Z座標リストの一つにに対応するリージョン配列を取得
    // Game_Farm.prototype.ArrayRegionZco = function(param) {
    //     const paramKeyBase = JSON.parse(parameterRegionArray[param - 1]);
    //     const paramRegionArray = paramKeyBase["regionArrayGTT"];
    //     return paramRegionArray;
    // }

    // //Z座標リストの一つに対応するz座標を取得
    // Game_Farm.prototype.zcoRegionZco = function(param) {
    //     const paramKeyBase = JSON.parse(parameterRegionArray[param - 1]);
    //     const paramRegionArray = paramKeyBase["regionZcoGTT"];
    //     return paramRegionArray;
    // }

    // ================================================================
    //
    // マップ上に探索ポイントを生成                             
    //         
    // ================================================================



    // isPassable

    // ================================================================
    // 何度も使う処理
    // ================================================================

    // class dataForEventRespawn {
    //     constructor(id, x, y) {
    //         this._id = id;
    //         this._x = x;
    //         this._y = y;
    //         this._template = true;
    //     }
    // }

    // // プラグインに登録したフィールドイベントデータ
    // class fieldEvent {
    //     constructor(eventData) {
    //         this.id = eventData.id;
    //         this.role = eventData.role;
    //         this.frequency = Number(eventData.frequency);
    //         this.eventSight = eval(eventData.eventSight);
    //         this.eventData = eventData;
    //     }
    //     // フィールドイベントが設置に要求する条件
    //     requirement() {
    //         let ObjList = JSON.parse(this.eventData.requirement);
    //         for (let v in ObjList) {
    //             if (Array.isArray(eval(ObjList[v]))) {ObjList[v] = eval(ObjList[v]).map(Number)}
    //         } 
    //         return ObjList;
    //     }
    //     // フィールドイベントの詳細設定
    //     detailOptions() {
    //         let list = JSON.parse(this.eventData.detailOptions).map((v) => {
    //             const obj = JSON.parse(v);
    //             obj.charaImgIndex = Number(obj.charaImgIndex);
    //             obj.direction = Number(obj.direction);
    //             obj.eventSight = eval(obj.eventSight);
    //             obj.spawnRateToRegionOrTerrain = JSON.parse(obj.spawnRateToRegionOrTerrain).map((w) => {
    //                 const objw = JSON.parse(w);
    //                 return {
    //                     region: Number(objw.region),
    //                     terrain: Number(objw.terrain),
    //                     frequency: Number(objw.frequency)
    //                 };
    //             });
    //             return obj;
    //         });
    //         return list;
    //     }
    // }

    class GTT_Data_Dungeon {
        constructor() {
            this._data = params.DUNGEON_EVENTS_LIST;
            this._rateList = params.DUNGEON_EVENTS_RATE;
            this.setup();
        }
        setup() {
            this._data = JSON.parse(this._data).map((v) => {
                v = JSON.parse(v);
                v.frequency = JSON.parse(v.frequency).map(Number);
                return v
            });
            this._rateList = JSON.parse(this._rateList).map((v) => {return Number(JSON.parse(v))});
        }
        normalEvents() {
            return this._data.filter((v) => {return v.role === "null" || v.role === "character"})
        }
        normalEventRates(value) {
            return this.normalEvents().map((data) => {
                return data.frequency[value];
            })
        }
        rateList() {
            return this._rateList;
        }
        eventKinds() {
            return this.normalEvents().length + 1;
        }
    }

    $dataDungeon = new GTT_Data_Dungeon();

    class GTT_Data_FieldEvent {
        constructor() {
            this._setting = params.FIELD_EVENTS_SETTING;
            this._data = params.FIELD_EVENTS_LIST;
            this._roles = ["dungeon", "ruin", "enemy_character", "neutral_character", "relic"];
            this._lot = new GTT_Lot();
            this.setup();
        }
        // ================================================================
        // 初期設定
        // ================================================================
        setup() {
            this.setupData();
            this.setupSetting();
        }
        setupData() {
            this._data = JSON.parse(this._data).map((v) => {
                v = JSON.parse(v);
                v.frequency = JSON.parse(v.frequency);
                v.requirement = JSON.parse(v.requirement);
                v.detailOptions = JSON.parse(v.detailOptions).map(JSON.parse);
                return v;
            })
            this.setupRequirment();
        }
        setupRequirment() {
            for (let i = 0; i < this._data.length; i++) {
                let requirment = this._data[i].requirement;
                for (let v in requirment) {
                    if (Array.isArray(eval(requirment[v]))) {
                        requirment[v] = eval(requirment[v]).map(Number);
                    };
                }
            }
            this.setupDetailOption();
        }
        setupDetailOption() {
            for (let i = 0; i < this._data.length; i++) {
                const detailOptions = this._data[i].detailOptions;
                for (const option of detailOptions) {
                    option.charaImgIndex = Number(option.charaImgIndex);
                    option.direction = Number(option.direction);
                    if (option.spawnRateToRegionOrTerrain) {
                        option.spawnRateToRegionOrTerrain = JSON.parse(option.spawnRateToRegionOrTerrain).map((v) => {
                            v = JSON.parse(v);
                            for (let rate in v) {
                                v[rate] = Number(v[rate]);
                            }
                            return v;
                        });
                    } else {
                        option.spawnRateToRegionOrTerrain = [];
                    }
                }
            }
        }
        setupSetting() {
            this._setting = JSON.parse(this._setting);
            this._setting.activeScope = JSON.parse(this._setting.activeScope);
            this._setting.spawnRate = JSON.parse(this._setting.spawnRate);
        }
        // ================================================================
        // データ取得(上位)
        // ================================================================
        eventData(value) {
            return this._data[value];
        }
        category(value) {
            return this._data.filter((v) => {
                return v.role === this.roleId(value);
            });
        }
        frequencies(value) {
            return this.category(value).map((data) => {
                return data.frequency;
            })
        }
        roleId(value) {
            return this._roles[value];
        }
        // そのイベントがあるroleかどうか
        isCategory(param1, param2) {
            return this._data[param1].role === this._roles[param2];
        }
        // イベントのリストから一つを選定
        randomSelect(value) {
            // くじの本数の配列を用意
            const lotNumList = this.frequencies(value);
            // くじを引く
            const lotIndex = this._lot.lot(lotNumList);
            // くじで当たったイベントのデータIDを取得
            const selectedId = this.category(value)[lotIndex].id;
            // 取得したデータIDと一致するイベントの、イベントデータリスト内でのインデックスを返す
            return this._data.findIndex((v) => {
                return v.id === selectedId;
            });
        }
        // ================================================================
        // データ取得(下位)
        // ================================================================
        // 役割
        dungeonRoleId() {
            return this._roles[0];
        }
        ruinRoleId() {
            return this._roles[1];
        }
        // くじの本数(出現しやすさ)
        dungeonFrequencies() {
            return this.frequencies(this.dungeonRoleId());
        }
        ruinFrequencies() {
            return this.frequencies(this.ruinRoleId());
        }
        buildingFrequencies() {
            return [...this.dungeonFrequencies(), ...this.ruinFrequencies()];
        }
        // そのイベントが "dungeon"か
        isDungeon(value) {
            return this.isCategory(value, 0);
        }
        // そのイベントが "ruin"か
        isRuin(value) {
            return this.isCategory(value, 1);
        }
        isBuildingRole(param) {
            const value = this._roles.indexOf(param);
            return this.isDungeon(value) || this.isRuin(value);
        }
        // 一時イベントのデータリスト
        tempEventData() {
            return [...this.category(this._rales[2]), ...this.category(this._rales[3]), ...this.category(this._rales[4])];
        }
    }
    
    $dataFieldEvent = new GTT_Data_FieldEvent();

    // ================================================================
    // リスポーン　足りない数だけイベントを追加する
    // ================================================================

    // // フィールドに設置する共通イベントの設置データリストを作成
    // Game_Farm.prototype.tempCommonFieldEventsRespawnData = function(id) { // テンプレートイベントのID
    //     const data = new dataForEventRespawn(id, 0, 0);
    //     const dataList = new Array(this.needEventsNum());
    //     dataList.fill(data);
    //     return dataList;
    // }

    // // 既にあるイベントで足りるかどうか
    // Game_Farm.prototype.needEventsNum = function() {
    //     const setEventsNum = this.tempSettingFieldEventDataList().length;
    //     const deactiveEventsNum = $gameMap.deactiveEventsNum();
    //     const needEventsNum = Math.max(setEventsNum - deactiveEventsNum, 0);
    //     return needEventsNum;
    // }

    // ================================================================
    //
    // エリア収縮に関する処理
    //
    // ================================================================

    // function maxAreaPhase(n, m) {
    //     for (let i = 0, end = false; end === false; i++) {
    //         if ((i + 1) * i / 2 >= n * m) {return i + 1}
    //     }
    // }

    // Game_Farm.prototype.createRingShrinkPlan = function(n, m) {
    //     const maxPhase = maxAreaPhase(n, m);
    //     const plan = Array.from({length:m}, () => Array(n));
    //     //まず最終エリアを決める
    //     const finalArea = [random(n-1, 0), random(m-1, 0)];
    //     plan[finalArea[1]][finalArea[0]] = maxPhase;
    //     //距離ごとのリストを作る
    //     const distanseList = Array.from({length:(Math.max(n, m) - 1) * 2}, () => Array())
    //     for (let i = 0; i < m; i++) {
    //         for (let j = 0; j < n; j++) {
    //             const xD = Math.abs(j - finalArea[0]);
    //             const yD = Math.abs(i - finalArea[1]);
    //             if (xD + yD > 0) {distanseList[xD + yD - 1].push([j, i])};
    //         }
    //     }
    //     //次に他のエリアを決める
    //     // let doNum = 0;
    //     // distanseList.forEach((value, index) => {
    //     //     const list = [...value];
    //     //     for (let i = 0; i < value.length; i++) {
    //     //         const randomIndex = random(list.length - 1, 0);
    //     //         const xY = list[randomIndex];
    //     //         plan[xY[1]][xY[0]] = maxPhase - (index + 1);
    //     //         list.splice(randomIndex, 1);
    //     //     }
    //     // })
    //     for (let i = 0, dLevel = 0, doNum = 0; i < maxPhase - 1 && doNum < n * m - 1; i++) {
    //         for (let j = 0; j < i + 1; j++) {
    //             const index = random(distanseList[dLevel].length - 1, 0) //一つの絶対値距離リストの中から一つを抽出
    //             const xY = distanseList[dLevel][index];
    //             plan[xY[1]][xY[0]] = maxPhase - (i + 1);
    //             distanseList[dLevel].splice(index, 1);
    //             doNum++;
    //             if (distanseList[dLevel].length === 0) {dLevel++} //一つの絶対値距離リストを使い切ったら１つ遠い距離のリストに移行する
    //         }
    //     }
    //     return plan;
    // }

    // ================================================================
    //
    // フィールドイベント                    
    //         
    // ================================================================

    // ================================================================
    // フィールドイベントのデータ基盤
    // ================================================================
    class GTT_FieldEventBase {
        constructor(param1, param2) {
            this._dataId = param1;
            this.id = param2;
            this._x = 0;
            this._y = 0;
            this._found = false;
            this.setup();
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        // ================================================================
        // 数値入力
        // ================================================================
        setup() {
            // 座標
            const spot = this.spawnSpot();
            this._x = spot[0];
            this._y = spot[1];
        }
        // ================================================================
        // データ取得/変更
        // ================================================================
        eventData() {
            return $dataFieldEvent.eventData(this._dataId);
        }
        found() {
            return this._found;
        }
        setFound(value) {
            this._found = value;
        }
        // ================================================================
        // 各種処理
        // ================================================================
        // イベントを配置する座標を決める
        spawnSpot() {
            const x = $gameFarm.randomX();
            const y = $gameFarm.randomY();
            if (this.canSpawnArea(x, y) && this.canSpawnSpace(x, y)) {
                return [x, y];
            } else {
                return this.spawnSpot();
            }
        }
        // スポーンできるか(ある座標に)
        canSpawnArea(x, y) {
            if ($gameMap.regionId(x, y)) {
                const onRegion = $gameMap.regionId(x, y);
                const onTerrain = $gameMap.terrainTag(x, y);
                return this.canSpawnToRegion(onRegion) && this.canSpawnToTerrain(onTerrain);
            }
            return false;
        }
        // スポーンできるか(リージョンによって)
        canSpawnToRegion(onRegion) {
            const requirementList = $dataFieldEvent.eventData(this._dataId).requirement;
            if (requirementList) {
                const regionList = requirementList.region; //形態が "" "[]" "["a", "b", "c"]"なので JSON.parse だとエラーを吐いてしまう
                const notRegionList = requirementList.notRegion; // "" が [] or {} でないため
                // 出現リージョンリストがあるか or 出現リージョンリスト内にonRegionがあるか
                if (!regionList || !regionList.length || regionList.includes(onRegion)) { //""内に要素がある場合は、ここで要素をNumberに変換する
                    if(!notRegionList || !notRegionList.length || !notRegionList.includes(onRegion)) { // 非出現リージョンリスト内にないあるいはリストがないか
                        return true
                    }
                }
                return false;
            }
            return true;  // そもそも [...list][i].requirement.regionが定義されてない場合はもうスポーンできる
        }
        // スポーンできるか(地形タグによって)
        canSpawnToTerrain(onTerrain) {
            const requirementList = $dataFieldEvent.eventData(this._dataId).requirement;
            if (requirementList) {
                const terrainList = requirementList.terrain; //形態が "" "[]" "["a", "b", "c"]"なので JSON.parse だとエラーを吐いてしまう
                const notTerrainList = requirementList.notTerrain; // "" が [] or {} でないため
                // 出現地形タグリストがあるか or 出現地形タグリスト内にonRegionがあるか
                if (!terrainList || !terrainList.length || terrainList.includes(onTerrain)) { //""内に要素がある場合は、ここで要素をNumberに変換する
                    if(!notTerrainList || !notTerrainList.length || !notTerrainList.includes(onTerrain)) { // 非出現地形タグリスト内にないあるいはリストがないか
                        return true
                    }
                }
                return false;
            }
            return true;  // そもそも [...list][i].requirement.regionが定義されてない場合はもうスポーンできる
        }
        // イベントを配置できる空間があるかどうか
        canSpawnSpace(x, y) {
            if ($dataFieldEvent.isDungeon(this._dataId)) {
                return $gameFarm.notExistAround(x, y);
            } else
            if ($dataFieldEvent.isRuin(this._dataId)) {
                return $gameFarm.canRuinSpawn(x, y);
            }
        }
    }

    // ================================================================
    // 
    // ダンジョンデータ
    // 
    // ================================================================

    class GTT_DungeonBase {
        constructor(x, y) {
            this._x = x;
            this._y = y;
            this._maps = [];
            this._exploredMaps = [];
            this._events = [];
            this._activate = true;
        }
        // ================================================================
        // 初期設定
        // ================================================================
        // 探索済みマップの初期作成
        createExploredMap() {
            this._exploredMaps = new Array(this.stageNum());
            for (let i = 0; i < this._exploredMaps.length; i++) {
                this._exploredMaps[i] = Array.from({length: this.size(i)[1]}, () => Array(this.size(i)[0]).fill(0));
            }
        }
        // ================================================================
        // アクティブ化
        // ================================================================
        // ダンジョンデータのアクティベート化
        activate() {
            if (!this.isDeactive()) {
                this.deployAll();
                this._activate = true;
            }
        }
        deactivate() {
            if (this.isActive()) {
                this.compressAll();
                this._activate = false;
            }
        }
        isActive() {
            return this._activate;
        }
        isDeactive() {
            return !this._activate;
        }
        // ダンジョンデータのディアクティベート化
        // ================================================================
        // 展開/圧縮
        // ================================================================
        // 展開
        deployAll() {
            this._maps = this._maps.split(",");
            this._exploredMaps = this._exploredMaps.split(",");
            for (let i = 0; i < this.stageNum(); i++) {
                this._maps[i] = this.deploy(this._maps[i]);
                this._exploredMaps[i] = this.deploy(this._exploredMaps[i]);
            }
        }
        deploy(strings) {
            return strings.split(" ").map((string) => {return string.split("").map(Number)});
        }
        // 圧縮
        compressAll() {
            for (let i = 0; i < this.stageNum(); i++) {
                this._maps[i] = this.compress(this._maps[i]);
                this._exploredMaps[i] = this.compress(this._exploredMaps[i]);
            }
            this._maps = this._maps.join(",");
            this._exploredMaps = this._exploredMaps.join(",");
        }
        compress(links) {
            return links.map((link) => {return link.join("")}).join(" ");
        }
        // ================================================================
        // 現在のダンジョンデータ
        // ================================================================
        currentStageMap() {
            const value = $gameFarm.currentStage() - 1;
            return this.stageMap(value);
        }
        currentExploredMap() {
            const value = $gameFarm.currentStage() - 1;
            return this.exploredMap(value);
        }
        currentEvents() {
            const value = $gameFarm.currentStage() - 1;
            return this.events(value);
        }
        currentEventsNum() {
            const value = $gameFarm.currentStage() - 1;
            return this.eventsNum(value);
        }
        currentSize() {
            const value = $gameFarm.currentStage() - 1;
            return this.size(value);
        }
        currentEntrance() {
            const value = $gameFarm.currentStage() - 1;
            return this.entrance(value);
        }
        // ================================================================
        // ダンジョンデータ
        // ================================================================
        // ある階のマップを取得
        stageMap(value) {
            return this._maps[value];
        }
        // 視界データ関連
        exploredMap(value) { //ある階層の到達データを取得
            return this._exploredMaps[value];
            // return this.recreateArray(mapData);
        }
        isExplored(value, x, y) {
            return Boolean(this._exploredMaps[value][y][x]);
        }
        // ある階のイベントデータを取得
        events(value) {
            return this._events[value];
        }
        // ある階のイベントの数を取得
        eventsNum(value) {
            return this._events[value].reduce((total, current) => {
                return total + current.length;
            }, 0); // this._events[value][0].length
        }
        // イベントの種類
        eventsVarious() {
            return this._events.length;
        }
        // ある階のイベントデータを消去
        clearEvents() {
            this._events = [];
        }
        size(value) {
            return [this.stageMap(value)[0].length, this.stageMap(value).length];
        }
        // ある階の入り口の座標
        entrance(value) {
            const x = this._events[value][0][0][0] + this.dungeonOriginX(value);
            const y = this._events[value][0][0][1] + this.dungeonOriginY(value);
            return [x, y];
        }
        // ================================================================
        // 座標系データ
        // ================================================================
        // 移動可能領域のx座標
        dungeonOriginX(value) {
            return Math.floor(($gameMap.width() - this.size(value)[0]) / 2);
        }
        // 移動可能領域のy座標
        dungeonOriginY(value) {
            return Math.floor(($gameMap.height() - this.size(value)[1]) / 2);
        }
        // ================================================================
        //  到達データの更新
        // ================================================================
        updateCurrentExplored(x, y) {
            const value = $gameFarm.currentStage() - 1;
            this.updateExplored(value, x, y);
        }
        updateExplored(value, x, y) {
            // まず探索データを取得
            if (!this.isExplored(value, x, y)) {
                // 指定座標が探索済みじゃなかったら探索済みにする
                this._exploredMaps[value][y][x] = 1;
            }
        }
        // // ================================================================
        // // タイル
        // // ================================================================
        // // マップ生成用の配列を作成する
        // dungeonTileData(tileX, tileY, value) {
        //     // マップの生成
        //     const toX = this.dungeonOriginX(value); //移動可能領域の原点のx座標
        //     const toY = this.dungeonOriginY(value); //移動可能領域の原点のy座標

        //     const data = [];
        //     for(let y = 0; y < this.size(value)[1]; y++) {
        //         for(let x = 0; x < this.size(value)[0]; x++) {
        //             const link = this.stageMap(value)[y][x];
        //             let fromX = 0;
        //             if (link === 0) {
        //                 fromX = tileX[0];
        //             } else 
        //             if (link === 1) {
        //                 fromX = tileX[1];
        //             } else
        //             if (link === 2) {
        //                 fromX = tileX[2];
        //             } else
        //             if (link === 3) {
        //                 fromX = this.stageMap(value)[y-1][x] === 0 || this.stageMap(value)[y-1][x] === 1 ? tileX[4] : tileX[3];
        //             }
        //             data.push({
        //                 fromX: fromX,
        //                 fromY: tileY,
        //                 toX: toX + x,
        //                 toY: toY + y
        //             })
        //         }
        //     }
        //     return data;
        // }
        // // ================================================================
        // // イベントの配置
        // // ================================================================
        // setEvents(value) {
        //     // イベントを配置して設定を完了する
        //     for (let type = 0; type < this.events(value).length; type++) {
        //         for (const xy of this.events(value)[type]) {
        //             if (xy.length) {
        //                 const x = xy[0] + this.dungeonOriginX(value);
        //                 const y = xy[1] + this.dungeonOriginY(value);
        //                 this.setEvent(type, x, y);
        //             }
        //         }
        //     }
        // }
        // setEvent(param1, param2, param3) {
        //     const baseEvent = $gameMap.events().find((event) => {
        //         return event && !event.isActive();
        //     });
        //     baseEvent.locate(param2, param3);
        //     baseEvent.setActive(true);
        //     // baseEvent.setImage("!Flame", 4);
        // }
    }

    // ================================================================
    //
    // ダンジョン生成                            
    //         
    // ================================================================

    const ADD_STAGE_RATE = 60;


    class GTT_Maze extends GTT_DungeonBase {
        constructor(x, y) {
            super(x, y);
            // 完成したデータをいれるプロパティ
            this._walls = [];
            this._maps = [];
            this._events = [];
            // 生成時に一時的にデータを入れるプロパティ
            // this._stageNum = 0;
            // this._size = [];
            this._links = [];
            this._reachedMap = [];
            this._pathNumList = [];
            // メソッド
            // this._lot = new GTT_Lot();
            // 設定
            this.setup();
            this.createExploredMap();
        }
        // ================================================================
        // 上位処理
        // ================================================================
        // 階層と大きさだけ先に決める
        setup() {
            this.createBase();
            this.setupEvent();
            this.createDungeon();
            this.deleteProps();
        }
        setupEvent() {
            this._events = new Array(this.stageNum());
            for (let i = 0; i < this._events.length; i++) {
                const list = [];
                for (let j = 0; j < $dataDungeon.eventKinds(); j++) {
                    list.push([])
                }
                this._events[i] = list;
            }
        }
        // 階層と大きさを決めて生成用のプロパティを用意
        createBase() {
            const stageNum = this.createStageNum();
            this._maps = new Array(stageNum);
            for (let i = 0; i < this._maps.length; i++) {
                const size = this.createStageSize();
                this._maps[i] = Array.from({length: size[1]}, () => Array(size[0]).fill(0));
            }
        }
        // マップ生成 + イベント生成
        createDungeon() {
            this.createDungeonMap();
            this.createDungeonEvents();
        }
        // 生成用のプロパティの削除
        deleteProps() {
            delete this._links;
            delete this._walls;
            delete this._reachedMap;
            delete this._pathNumList;
        }
        // ================================================================
        // 準備
        // ================================================================
        // clear() {
        //     this._maps = [];
        //     this._events = [];
        //     this._stageNum = 0;
        //     this._size = [];
        //     this._links = [];
        //     this._reachedMap = [];
        //     this._pathNumList = [];
        // }
        // 階層数を決定
        createStageNum() {
            return this.addMoreStage(1);
        }
        addMoreStage(value) {
            if (Math.random() * 100 < ADD_STAGE_RATE && value < MAX_LEVEL) {
                return this.addMoreStage(value + 1);
            } else {
                return value;
            }
        }
        // 一階層分のマップ生成のための準備
        setupLinksBase(value) {
            this._links = this._maps[value];
            this._reachedMap = this._maps[value];
        }
        // マップの大きさを決める
        createStageSize() {
            const size =  Math.floor(Math.random() * (2 + 1)) * 2 + 3; //とりあえず(3/)5/7/9のランダムで
            return [size, size];
        }
        clearLinksBase() {
            this._links = [];
            this._reachedMap = [];
        }
        // ================================================================
        // データ
        // ================================================================
        maps() {
            return this._maps;
        }
        events() {
            return this._events;
        }
        stageNum() {
            return this._maps.length;
        }
        size(value) {
            const w = this._maps[value][0].length;
            const h = this._maps[value].length;
            return [w, h];
        }
        // ================================================================
        // 
        // マップ生成
        // 
        // ================================================================
        // ================================================================
        // データ
        // ================================================================
        links() {
            return this._links;
        }
        linksWidth() {
            return this._links[0].length;
        }
        linksHeight() {
            return this._links.length;
        }
        // 全フロア分の圧縮されたマップデータを生成
        createDungeonMap() {
            for (let i = 0; i < this.stageNum(); i++) {
                this.setupLinksBase(i);
                this.createMap();
                this._maps[i] = this._walls;
            }
            this.clearLinksBase();
        }
        // ================================================================
        // ステージごとのマップ生成
        // ================================================================
        // ダンジョンマップを生成する(ﾋﾄﾂﾋﾄﾂ修正する版)
        createMap() {
            this.createAllLinks(); //ランダムでダンジョンマップを生成
            //条件に合うマップを生成するまで修正を繰り返す
            this.modifiedMap(); // 到達不可能タイルが0になるまで修正を繰り返す
            // 壁情報に変換
            this.createWalls();
            // this.createRoomSizeList();
        }
        // 隣のノードと一つもつながりを持っていないノードのリンクを修正する
        modifiedMap() { //vはunreachableTile
            if (!this.isConnectedAll()) {
                const tileList = this.unreachableTile();
                for(let i = 0; i < tileList.length; i++) {
                    const x = tileList[i][0];
                    const y = tileList[i][1];
                    this.createLink(x, y); //リンクの修正
                }
                this.modifiedMap();
            } 
        }
        createAllLinks() {
            for (let y = 0; y < this.linksHeight(); y++) {
                for (let x = 0; x < this.linksWidth(); x++) {
                    this.createLink(x, y);
                }    
            }
        }
        createLink(x, y) {
            const w = this.linksWidth();
            const h = this.linksHeight();
            let linkType = 0;
            if (y > 0) {
                if (x === (w - 1) && this._links[y-1][x] === 0) { // 右端の列で縦２連0の時確定で孤立するのでその回避処理
                    linkType += 1;  // 上方向のリンクを追加
                } else {
                    linkType += Math.random() > 0.5 ? 1 : 0;  // 上方向のリンクを追加
                }
            }
            if (x > 0) {
                if (y === (h - 1) && this._links[y][x-1] === 0) { // 最下段の行で横２連0の時確定で孤立するのでその回避処理
                    linkType += 2;  // 左方向のリンクを追加
                } else {
                    linkType += Math.random() > 0.5 ? 2 : 0;  // 左方向のリンクを追加
                }
            }
            if (x === (w - 1) && y === (h - 1)) {linkType = Math.floor(Math.random() * 4)};
            this._links[y][x] = linkType;
        }
        // ノードが全て繋がっているか検証する
        isConnectedAll() {
            const w = this.linksWidth();
            const h = this.linksHeight();
            this._reachedMap = Array.from({length: h}, () => Array(w).fill(false));
            this.checkConnectivity(0, 0); //チェック開始
            return this._reachedMap.every((v) => {
                return v.every((w) => {return w})
            })
        }
        //１つのノードが最低一つのつながりを持っているか検証する
        checkConnectivity(x, y) {
            this._reachedMap[y][x] = 1;
            const direction = [[1, 0], [0, 1], [-1, 0], [0, -1]]; //方向を格納
            for (const d of direction) {
                const nX = x + d[0]; //隣のx座標を設定
                const nY = y + d[1]; //隣のy座標を設定
                if (this.isInArea(nX, nY)) {//隣が存在しているか
                    if (!this._reachedMap[nY][nX]) {//隣に到達済みか
                        if (this.isConnected(x, y, nX, nY)) {//隣あるいは現在のノードの条件
                            this.checkConnectivity(nX, nY);
                        }
                    }
                }
            }
        }
        isInArea(x, y) {
            return (
                x >= 0 &&
                x < this.linksWidth() &&
                y >= 0 &&
                y < this.linksHeight()
            )
        }
        // 指定した方向の隣のノードと繋がっているか検証
        isConnected(fromX, fromY, toX, toY) {
            let subX = toX - fromX > 0 || toY - fromY > 0 ? toX : fromX; //隣のノードのx座標を取得
            let subY = toX - fromX > 0 || toY - fromY > 0 ? toY : fromY; //隣のノードのy座標を取得
            const availLink = (toX === fromX ? 1 : 2); //x座標が同じなら縦の接続、そうじゃないなら横の接続が可能か
            return this._links[subY][subX] === 3 || this._links[subY][subX] === availLink; //結果を返す
        }
        // 隣のノードと一つもつながりを持っていないノードを全て取得
        unreachableTile() {
            const unreachableTile = [];
            for (let y = 0; y < this.linksHeight(); y++) { 
                for(let x = 0; x < this.linksWidth(); x++) { //reachedMap[y]の各要素がfalseか調べて、
                    if(!this._reachedMap[y][x]) {unreachableTile.push([x, y])} //falseならその座標を格納する
                }
            }
            return unreachableTile;
        }
        // ================================================================
        // 
        //  どの方向に通路が通じているかを含めたデータに変換
        // 
        // ================================================================
        createWalls() {
            this._walls = Array.from({length: this._links.length}, () => Array(this._links[0].length).fill());
            for (let y = 0; y < this._links.length; y++) {
                for (let x = 0; x < this._links[0].length; x++) {
                    this._walls[y][x] = this.wall(x, y);
                }
            }
        }
        wall(x, y) {
            let wallData = "";
            //マイナス方向
            const a = this._links[y][x];
            // 上
            if (a === 0 || a === 2 || y === 0) {
                wallData += "1";
            } else {
                wallData += "0";
            }
            // 左
            if (a === 0 || a === 1 || x === 0) {
                wallData += "1";
            } else {
                wallData += "0";
            }
            // 右
            if (x + 1 < this._links[y].length) {
                const b = this._links[y][x + 1];
                if (b === 0 || b === 1) {
                    wallData += "1";
                } else {
                    wallData += "0";
                }
            } else {
                wallData += "1";
            }
            // 下
            if (y + 1 < this._links.length) {
                const c = this._links[y + 1][x];
                if (c === 0 || c === 2) {
                    wallData += "1";
                } else {
                    wallData += "0";
                }
            } else {
                wallData += "1";
            }
            const wallType = this.wallType(wallData);
            const bitNumber = parseInt(wallData, 2);
            return bitNumber.toString(16) + wallType;
        }
        // ================================================================
        // 
        //  部屋の大きさ
        // 
        // ================================================================
        // 部屋をどう埋めるか
        wallType(string) {
            let wall = "";
            for (let i = 0; i < 4; i++) {
                if (string[i] === "1") {
                    if (Math.random() < 0.4) {
                        wall += "1";
                    } else {
                        wall += "0";
                    }
                } else {
                    wall += "0";
                }
            }
            return parseInt(wall, 2).toString(16);
        }
        // ================================================================
        // 
        //  イベント生成
        // 
        // ================================================================
        // name
        // eventId
        // eventName
        // role
        // frequency
        // [
        //     [[x, y], [x, y]], //入口出口の座標
        //     [[x, y]], //ユーザー定義のイベントの座標
        // ]
        // イベントデータリストは[0]が出入口の座標、[n(>0)]がユーザー定義のイベントの座標を表す
        // nは登録順(=DUNGEON_EVENTSでの順番)と同じ
        createDungeonEvents() {
            // this.createPathNumList();
            for (let stage = 0; stage < this.stageNum(); stage++) {
                this.setStairs(stage); //出入口の設置
                this.setUniqueEvents(stage); //ユーザー定義イベントの設置
                // this._events[stage] = [stairs, ...uniqueEvents];
            }
        }
        // ダンジョン内イベント生成準備
        // 一つのマスが隣り合ういくつのマスと繋がっているか取得
        createPathNumList() {
            this._pathNumList = [];
            for (let i = 0; i < this.stageNum(); i++) {
                this._pathNumList[i] = Array.from({length: this._maps[i].length}, () => Array(this._maps[i][0].length).fill(0))
            }
            // ステージごと
            for (let stage = 0; stage < this.stageNum(); stage++) {
                // 座標ごと
                for (let y = 0; y < this.size(stage)[1]; y++) {
                    for (let x = 0; x < this.size(stage)[0]; x++) {
                        this._pathNumList[stage][y][x] = this.pathNum(x, y, stage);
                    }
                }
            }
        }
        pathNum(x, y, value) {
            let path = 0;
            //マイナス方向
            const a = this._maps[value][y][x];
            if(a === 3) {
                path += 2
            } else
            if (a === 1 || a === 2) {
                path += 1
            }
            //プラス方向
            if (x < this.size(value)[0] - 1) {
                const b = this._maps[value][y][x + 1];
                if (b === 3 || b === 2) {
                    path += 1;
                }
            }
            if (y < this.size(value)[1] - 1) {
                const c = this._maps[value][y + 1][x];
                if (c === 3 || c === 1) {
                    path += 1;
                }
            }
            return path;
        }
        // 入口と出口を生成
        setStairs(value) {
            const size = this.size(value);
            // 入口(きた道)
            const entrance = [null, null];
            // if (value > 0) {
            //     // 2階以上だったら下の階の出口と同じ座標
            //     entrance = this._events[value - 1][0][1];
            // } else {
            //     entrance[0] = Math.floor(Math.random() * size[0]);
            //     entrance[1] = Math.floor(Math.random() * size[1]);
            // }
            entrance[0] = Math.floor(Math.random() * size[0]);
            entrance[1] = Math.floor(Math.random() * size[1]);
            this._events[value][0].push(entrance);
            // 出口(行く道)
            if (value < this.stageNum() - 1) {
                const exit = [null, null];
                for (let canSet = true; canSet;) {
                    exit[0] = Math.floor(Math.random() * size[0]);
                    exit[1] = Math.floor(Math.random() * size[1]);
                    canSet = (entrance[0] === exit[0] && entrance[1] === exit[1]); //入口と出口の座標が一致したら出口の座標を再設定
                }
                this._events[value][0].push(exit);
            }
        }
        // ユーザー定義イベント
        setUniqueEvents(value) {
            for (let y = 0; y < this._maps[value].length; y++) {
                for (let x = 0; x < this._maps[value][0].length; x++) {
                    const pathNum = this.pathNum(x, y, value);
                    // 設置するか
                    if (this.isNotEntrance(x, y, value)) {
                        if (Math.random() * 100 < $dataDungeon.rateList()[pathNum - 1]) {
                            // 何を設置するか
                            const rateList = $dataDungeon.normalEventRates(pathNum - 1);
                            const lot = new GTT_Lot();
                            const index = lot.lot(rateList);
                            this._events[value][index + 1].push([x, y]);
                        }
                    }
                }
            }
            // this._events[value] = [...this._events[value], ...uniqueEvents];
        }
        isNotEntrance(x, y, value) {
            const stairs = this._events[value][0];
            return stairs.every((stair) => {return x != stair[0] || y != stair[1]});
        }
        // ================================================================
        // 
        // マップ構築用タイルデータ生成
        // 
        // ================================================================
    }

    // $test = new GTT_Maze();

    // ================================================================
    //
    // あるダンジョンの現在のマップの管理                      
    //         
    // ================================================================

    class GTT_DungeonStage {
        constructor() {
            this._stage = 0;
            this._map = [];
            this._events = [];
            this._originX = 0// 10;
            this._originY = 0// 5;
            this._tile = [];
        }
        clear() {
            this._stage = 0;
            this._map = [];
            this._events = [];
        }
        setup(dungeonData, stage) {
            this.clear();
            this._stage = stage - 1;
            this._map = JSON.parse(JSON.stringify(dungeonData.maps()[this._stage]));
            this._events = dungeonData.events()[this._stage];
            this.setupWalls();
            this.createWallSetting();
        }
        setupWalls() {
            for (let y = 0; y < this._map.length; y++) {
                for (let x = 0; x < this._map[0].length; x++) {
                    const data = this._map[y][x];
                    // const roomData = {wall: ("0000" + parseInt(data[0], 16).toString(2)).slice(-4), size: Number(data[1])};
                    const roomData = {wall: ("0000" + parseInt(data[0], 16).toString(2)).slice(-4), type: ("0000" + parseInt(data[1], 16).toString(2)).slice(-4)};
                    this._map[y][x] = roomData;
                }
            }
        }
        // ================================================================
        // データ
        // ================================================================
        wall() {
            return this._wall;
        }
        floor() {
            return this._floor;
        }
        // ================================================================
        //
        // タイル設置用データの生成                    
        //         
        // ================================================================
        createWallSetting() {
            this._floor = [];
            this._wall = [];
            class roomData {
                constructor(param1, param2, param3, param4, param5, param6) {
                    this.fromX = param1;
                    this.fromY = param2;
                    this.width = param3;
                    this.height = param4;
                    this.toX = param5;
                    this.toY = param6;
                }
            }
            class wallData {
                constructor(param1, param2, param3, param4) {
                    this.fromX = param1;
                    this.fromY = param2;
                    this.width = 1;
                    this.height = 1;
                    this.toX = param3;
                    this.toY = param4;
                }
            }
            class typeData {
                constructor(param1, param2, param3, param4, param5, param6) {
                    this.fromX = param1;
                    this.fromY = param2;
                    this.width = param3;
                    this.height = param4;
                    this.toX = param5;
                    this.toY = param6;
                }
            }
            for (let y = 0; y < this._map.length; y++) {
                for (let x = 0; x < this._map[0].length; x++) {
                    // 座標
                    const originX = this._originX + x * 3;
                    const originY = this._originY + y * 3;
                    // 床
                    this._floor.push(new roomData(3, 0, 3, 3, originX, originY));
                    // 壁
                    const wall = this._map[y][x].wall;
                    if (wall[0] === "1") {
                        this._wall.push(new wallData(3, 3, originX + 1, originY));
                    }
                    if (wall[1] === "1") {
                        this._wall.push(new wallData(5, 3, originX, originY + 1));
                        this._wall.push(new wallData(11, 3, originX, originY));
                    }
                    if (wall[2] === "1") {
                        this._wall.push(new wallData(6, 3, originX + 2, originY + 1));
                        this._wall.push(new wallData(12, 3, originX + 2, originY));
                    }
                    if (wall[3] === "1") {
                        this._wall.push(new wallData(4, 3, originX + 1, originY + 2));
                    }
                    // 壁埋め
                    const type = this._map[y][x].type;
                    if (type[0] === "1") {
                        this._wall.push(new typeData(3, 9, 3, 1, originX, originY));
                        if (wall[1] === "1") { // 左も壁
                            if (type[1] === "1") { // 左も埋める
                                this._wall.push(new wallData(7, 3, originX, originY));
                            }
                        } else { // 左は通路
                            if (type[1] === "1") { // 左も埋める(存在しない)
                                this._wall.push(new wallData(7, 3, originX, originY));
                            } else {
                                this._wall.push(new wallData(8, 3, originX, originY));
                            }
                        }
                        // 右も壁
                        if (wall[2] === "1") { // 右も壁
                            if (type[2] === "1") { // 右も埋める
                                this._wall.push(new wallData(7, 3, originX + 2, originY));
                            }
                        } else { // 右は通路
                            if (type[2] === "1") { // 右も埋める(存在しない)
                                this._wall.push(new wallData(7, 3, originX + 2, originY));
                            } else {
                                this._wall.push(new wallData(8, 3, originX + 2, originY));
                            }
                        }
                    }
                    if (type[1] === "1") {
                        this._wall.push(new typeData(0, 9, 1, 3, originX, originY));
                    }
                    if (type[2] === "1") {
                        this._wall.push(new typeData(0, 9, 1, 3, originX + 2, originY));
                    }
                    if (type[3] === "1") {
                        this._wall.push(new typeData(0, 9, 3, 1, originX, originY + 2));
                    }
                }
            }
        }
    }

    // ================================================================
    //
    // ダンジョン管理                         
    //         
    // ================================================================

    class GTT_FieldDungeons {
        constructor() {
            this._dungeons = [];
            this._key = {x: 0, y: 0, index: 0, stage: 0};
            this._dungeon = new GTT_DungeonStage();
        }
        // ================================================================
        // データ
        // ================================================================
        dungeons() {
            return this._dungeons;
        }
        dungeon(value) {
            return this._dungeons[value];
        }
        dungeonXy(x, y) {
            return this._dungeons.find((dungeon) => {return dungeon._x === x && dungeon._y === y});
        }
        isDungeonExist(x, y) {
            return this._dungeons.some((dungeon) => {return dungeon._x === x && dungeon._y === y});
        }
        createStage(key) {
            this._key = key;
            this._dungeon.setup(this.dungeonXy(this._key.x, this._key.y), this._key.stage);
        }
        // ================================================================
        // 追加
        // ================================================================
        // ダンジョンデータを追加する
        createNewMaze(x, y) {
            this._dungeons[this._dungeons.length] = new GTT_Maze(x, y);
        }
    }

    // ================================================================
    //
    // 視界                     
    //         
    // ================================================================

    class GTT_Sight {
        constructor() {
            this._characterId = 0;
            this._sightRange = 0;
            // this._x = 0;
            // this._y = 0;
            this._mapType = "";
            this._dungeonWidth = 0;
            this._dungeonHeight = 0;
            this._dungeonOriginX = 0;
            this._dungeonOriginY = 0;
            this._dungeonMap = [];
            this._latest = true;
            // メソッド用プロパティ
            this._sightLevelMap = [];
            this._tempSightLevelMap = [];
            this._reachedMap = [];
            this._mapInSight = [];
            this._tileListScope = [];
            this._tileScreenDataList = [];
        }
        // ================================================================
        // 数値設定
        // ================================================================
        setMapType(value) {
            this._mapType = value;
        }
        setDungeonSize(w, h) {
            this._dungeonWidth = w;
            this._dungeonHeight = h;
        }
        setDungeonOrigin() {
            this._dungeonOriginX = ($gameMap.width() - this.stageWidth()) / 2;
            this._dungeonOriginY = ($gameMap.height() - this.stageHeight()) / 2;
        }
        setDungeonMap(list) {
            this._dungeonMap = list;
        }
        setSight(value) {
            this._sightRange = value;
        }
        // ================================================================
        // 基礎データ
        // ================================================================
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
        // updateLocation(x, y) {
        //     this._x = x;
        //     this._y = y;
        // }
        sightLevelMap() {
            return this._tempSightLevelMap;
        }
        tileInScope() {
            return this._tileListScope;
        }
        // データを更新したか(更新したときのみ視界描画を更新する)
        isLatest() {
            return this._latest;
        }
        setLatest(value) {
            this._latest = value;
        }
        stageWidth() {
            return this._dungeonMap[0].length;
        }
        stageHeight() {
            return this._dungeonMap.length;
        }
        // ================================================================
        // 各種データ取得
        // ================================================================
        // 移動可能領域内のプレイヤーx座標
        inMapCharacterX() {
            if($gameFarm.isInDungeon()) {
                return this.subjectCharacter().x - this._dungeonOriginX;
            } else
            if ($gameFarm.isInField()) {
                return $gamePlayer.x;
                return Math.floor((Graphics.boxWidth / $gameMap.tileWidth() - 1) / 2)// 9;
            }
        }
        // 移動可能領域内のプレイヤーy座標
        inMapCharacterY() {
            if($gameFarm.isInDungeon()) {
                return this.subjectCharacter().y - this._dungeonOriginY;
            } else
            if ($gameFarm.isInField()) {
                return $gamePlayer.y;
                return Math.floor((Graphics.boxHeight / $gameMap.tileHeight() - 1) / 2)// 5;
            }
        }
        inScreenCharacterX() {
            return Math.floor((Graphics.boxWidth / $gameMap.tileWidth() - 1) / 2)// 9;
        }
        inScreenCharacterY() {
            return Math.floor((Graphics.boxHeight / $gameMap.tileHeight() - 1) / 2)// 5;
        }
        // 視界内でのプレイヤーのx座標
        inSightCharacterX() {
            return Math.min(this._sightRange, this.inMapCharacterX());
        }
        // 視界内でのプレイヤーのy座標
        inSightCharacterY() {
            return Math.min(this._sightRange, this.inMapCharacterY());
        }
        // 移動可能領域内の視界の原点のx座標
        inMapSightOriginX() {
            return Math.max(this.subjectCharacter().x - this._sightRange - this._dungeonOriginX, 0);
        }
        // 移動可能領域内の視界の原点のy座標
        inMapSightOriginY() {
            return Math.max(this.subjectCharacter().y - this._sightRange - this._dungeonOriginY, 0);
        }
        // 視界の原点のx座標
        sightOriginX() {
            return Math.max(this.inMapCharacterX() - this._sightRange, 0);
        }
        // 視界の原点のy座標
        sightOriginY() {
            return Math.max(this.inMapCharacterY() - this._sightRange, 0);
            // return this.subjectCharacter().y - this.inSightCharacterY();
        }
        // 視界の端のx座標
        sightEndX() {
            return Math.min(this.inMapCharacterX() + this._sightRange, this.stageWidth() - 1);
        }
        // 視界の端のy座標
        sightEndY() {
            return Math.min(this.inMapCharacterY() + this._sightRange, this.stageHeight() - 1);
        }
        // 視界の幅
        sightW() {
            return Math.min(this.inMapCharacterX() + this._sightRange, this.stageWidth() - 1) - Math.max(this.inMapCharacterX() - this._sightRange, 0) + 1;
        }
        // 視界の高さ
        sightH() {
            return Math.min(this.inMapCharacterY() + this._sightRange, this.stageHeight() - 1) - Math.max(this.inMapCharacterY() - this._sightRange, 0) + 1;
        }
        // ================================================================
        // 上位処理
        // ================================================================
        updateSight() {
            // const sightRange = $gameFarm.sightRange()
            // this.setSight(sightRange);
            this.updateMapData();
            this.createTileMapInSight();
            this.createSightData();
            this.setLatest(true);
        }
        // // ================================================================
        // // 
        // // 可視性
        // // 
        // // ================================================================
        // // 半視界内or視界内のマスの座標を取得
        // // 射程範囲内のマスの座標を返す
        // createTileInScope() {
        //     // 視界の原点を取得
        //     const ox = this.sightOriginX();
        //     const oy = this.sightOriginY();
        //     this._tileListScope = [];
        //     for (let y = 0; y < this._tempSightLevelMap.length; y++) {
        //         for (let x = 0; x < this._tempSightLevelMap[0].length; x++) {
        //             if (this._tempSightLevelMap[y][x] > 0) {
        //                 const tileX = ox + x;
        //                 const tileY = oy + y;
        //                 this._tileListScope.push([tileX, tileY]);
        //             }
        //         }
        //     }
        // }
        // // 射程範囲内のマスの画面上の座標を返す
        // createTileScreenDataInScope(scope) {
        //     this.createTileListInScope(scope);
        //     this._tileScreenDataList = this._tileListScope.map((v) => {
        //         const tileScreenX = this.screenX() + ((v[0] - this.x) - 1 / 2) * $gameMap.tileWidth();
        //         const tileScreenY = this.screenY() + ((v[1] - this.y) - 1) * $gameMap.tileHeight() + 6;
        //         return [tileScreenX, tileScreenY];
        //     });
        // }
        // // ================================================================
        // // ダンジョン内での視界レベルデータの生成(キャラクター)
        // // ================================================================
        // createSightLevelMap() {
        //     if ($gameFarm.isInDungeon()) {
        //         // ダンジョン内にいるなら
        //         // this.setDungeonSize(...$gameFarm.currentDungeon().createStageSize());
        //         this.createDungeonMapInSight();
        //         this.createDungeonSightData(this.inSightCharacterX(), this.inSightCharacterY()); //視界レベルマップを作成
        //     } else
        //     if ($gameFarm.isInField()) {
        //         // フィールド上にいるなら
        //         this.createFieldMapInSight(this.subjectCharacter().x, this.subjectCharacter().y);
        //         this.createFieldSightData(); //常に視界の真ん中にいるので、x = playerSight, y = playerSightとなる
        //     }
        // }
        // // ダンジョンの視界内のマップを取得
        // // プレイヤーを中心とする視界×視界のマスのリンク情報を取得する
        // createDungeonMapInSight() {
        //     //プレイヤーの座標を設定
        //     const pX = this.inMapCharacterX(); //移動可能領域内でのプレイヤーのx座標
        //     const pY = this.inMapCharacterY(); //移動可能領域内でのプレイヤーのy座標
        //     const w = this.stageWidth();
        //     const h = this.stageHeight();
            
        //     this._mapInSight = [];
        //     for (let y = 0; y < h; y++) {
        //         // y >= (プレイヤーy座標 - 視界射程) と 0 の大きい方 かつ y <= (プレイヤーy座標 + 視界射程) と ダンジョンのy座標の最大値 の小さい方
        //         // とすることで、あらかじめ始点と終点を定めることなく、視界内のy座標の範囲の座標だけ収集する
        //         // const originY = Math.max(pY - this._sightRange, 0);
        //         // const endY = Math.min(pY + this._sightRange, h - 1);
        //         if (y >= this.sightOriginY() && y <= this.sightEndY()) {
        //             // x座標も同様の方法で指定し、その範囲の座標を収集する
        //             // const originX = Math.max(pX - this._sightRange, 0);
        //             // const endX = Math.min(pX + this._sightRange, w - 1);
        //             this._mapInSight.push(this._dungeonMap[y].slice(this.sightOriginX(), this.sightEndX() + 1));
        //         }
        //     }
        // }
        // // ダンジョン内であるマスに移動したときの視界レベルのデータを生成
        // createDungeonSightData(x, y) {
        //     this.checkDungeonSight(x, y);
        //     this._tempSightLevelMap = this._reachedMap.map((v) => {
        //         // 視界レベルを設定していく
        //         return v.map((w) => {
        //             if (w > 1) {
        //                 return 2; //経路２本以上あったら視界内
        //             } else if (w === 1) {
        //                 return 1; //経路1本だったら半視界内
        //             } else if (w === 0) {
        //                 return 0; //経路0本だったら視界外
        //             }   
        //         })
        //         // 視界レベル2:完全に視界内, 視界レベル1:半視界内 ちょっとくらいけど見えるレベル, 視界レベル0:遮蔽などで全く見えない
        //     });
        // }
        // // 視線がどれほど届くのか
        // checkDungeonSight(x, y) {
        //     //空白のリンクマップを生成
        //     this._reachedMap = Array.from({length: this._mapInSight.length}, () => Array(this._mapInSight[0].length).fill(0));
        //     this._reachedMap[y][x] = 2;
        //     //チェック開始
        //     this._newTile = [[x, y]];
        //     for (let distance = 0; distance < this._sightRange + 1; distance++) {
        //         const tile = [...new Set(this._newTile.map(JSON.stringify))].map(JSON.parse);
        //         this._newTile = [];
        //         for (const v of tile) {
        //             this.checkDungeonSightEach(v[0], v[1], distance);
        //         }
        //     }
        // }
        // // 隣のマスに視線が届くのか
        // checkDungeonSightEach(x, y, value) {
        //     const pX = this.inSightCharacterX();
        //     const pY = this.inSightCharacterY();
        //     const w = this.sightW();
        //     const h = this.sightH();

        //     // プレイヤーとは反対方向の隣のマスを収集していく
        //     // ただしプレイヤーと同一直線状の場合(x座標あるいはy座標が一致している場合)は、３方向を収集する
        //     const coAry = [];
        //     if (x - pX >= 0 && y - pY >= 0) {
        //         coAry.push([x + 1, y]);
        //         coAry.push([x, y + 1]);
        //     }
        //     if (x - pX >= 0 && y - pY <= 0) {
        //         coAry.push([x + 1, y]);
        //         coAry.push([x, y - 1]);
        //     }
        //     if (x - pX <= 0 && y - pY >= 0) {
        //         coAry.push([x - 1, y]);
        //         coAry.push([x, y + 1]);
        //     }
        //     if (x - pX <= 0 && y - pY <= 0) {
        //         coAry.push([x - 1, y]);
        //         coAry.push([x, y - 1]);
        //     }
        //     for (let i = 0; i < coAry.length; i++) {
        //         const nX = coAry[i][0];
        //         const nY = coAry[i][1];
        //         if (nX >= 0 && nX < w && nY >= 0 && nY < h) {//隣が存在しているか
        //             if (this.isConnected(x, y, nX, nY) && value < this._sightRange) {//隣あるいは現在のノードの条件
        //                 this._reachedMap[nY][nX]++;
        //                 this._newTile.push([nX, nY]);
        //             }
        //         }
        //     }
        // }
        // // 指定した方向の隣のノードと繋がっているか検証
        // isConnected(fromX, fromY, toX, toY) {
        //     let subX = toX - fromX > 0 || toY - fromY > 0 ? toX : fromX; //隣のノードのx座標を取得
        //     let subY = toX - fromX > 0 || toY - fromY > 0 ? toY : fromY; //隣のノードのy座標を取得
        //     let availLink = toX === fromX ? 1 : 2; //x座標が同じなら縦の接続、そうじゃないなら横の接続が可能か
        //     return this._mapInSight[subY][subX] === 3 || this._mapInSight[subY][subX] === availLink ? true : false; //結果を返す
        // }
        // // ================================================================
        // // フィールド上での視界レベルデータの生成(キャラクター)
        // // ================================================================
        // // プレイヤーを中心とした視界×視界の範囲の地形タグマップを生成
        // createFieldMapInSight(x, y) {
        //     const sw = this._sightRange * 2 + 1;
        //     this._mapInSight = Array.from({length: sw}, () => Array(sw));
        //     for (let dy = 0; dy < sw; dy++) {
        //         for (let dx = 0; dx < sw; dx++) {
        //             const targetX = x + dx - this._sightRange;
        //             const targetY = y + dy - this._sightRange;
        //             const terrainTag = $gameMap.terrainTag(targetX, targetY);
        //             this._mapInSight[dy][dx] = terrainTag; //$gameMap.layeredTiles($gamePlayer.x + x, $gamePlayer.y + y);
        //         }
        //     }
        // }
        // // フィールド上であるマスに移動したときの視界レベルのデータを生成
        // createFieldSightData() {
        //     this.checkFieldSight();
        //     this._tempSightLevelMap = this._reachedMap.map((v) => {
        //         return v.map((w) => {
        //             if (w > 1) {
        //                 return 2; //経路２本以上あったら視界内
        //             } else if (w === 1) {
        //                 return 1; //経路1本だったら半視界内
        //             } else if (w === 0) {
        //                 return 0; //経路0本だったら視界外
        //             }   
        //         })     
        //     })
        // }
        // // 視線がどれほど届くのか 
        // checkFieldSight() {
        //     //空白のリンクマップを生成
        //     // const sight = this.playerSight();
        //     const x = this._sightRange;
        //     const y = this._sightRange;
        //     this._reachedMap = Array.from(this._mapInSight, () => Array(this._mapInSight[0].length).fill(0));
        //     this._reachedMap[y][x] = this._sightRange;
        //     //チェック開始
        //     this._newTile = [[x, y, this._sightRange + 1]];
        //     for (let i = 0; i < this._sightRange; i++) {
        //         const tile = [...new Set(this._newTile.map(JSON.stringify))].map(JSON.parse);
        //         this._newTile = [];
        //         for (const v of tile) {
        //             this.checkFieldSightEach(v[0], v[1], v[2]);
        //         }
        //     }
        // }
        // // 隣のマスに視線が届くのか
        // checkFieldSightEach(x, y, value) {
        //     const pX = this.inSightCharacterX();
        //     const pY = this.inSightCharacterY();

        //     const coAry = [];
        //     if (x - pX >= 0 && y - pY >= 0) {
        //         coAry.push([x + 1, y]);
        //         coAry.push([x, y + 1]);
        //     }
        //     if (x - pX >= 0 && y - pY <= 0) {
        //         coAry.push([x + 1, y]);
        //         coAry.push([x, y - 1]);
        //     }
        //     if (x - pX <= 0 && y - pY >= 0) {
        //         coAry.push([x - 1, y]);
        //         coAry.push([x, y + 1]);
        //     }
        //     if (x - pX <= 0 && y - pY <= 0) {
        //         coAry.push([x - 1, y]);
        //         coAry.push([x, y - 1]);
        //     }
        //     for (let i = 0; i < coAry.length; i++) {
        //         const nX = coAry[i][0];
        //         const nY = coAry[i][1];
        //         const nextSightLv = this.nextSight(nX, nY, value);
        //         if(nextSightLv > 0) { //光のレベルが0より上の場合は隣のマスもまだ見える
        //             this._reachedMap[nY][nX] = Math.max(nextSightLv, this._reachedMap[nY][nX]);
        //             this._newTile.push([nX, nY, nextSightLv]);
        //         }
        //     }
        // }
        // nextSight(x, y, value) {
        //     if (this.isSightBlocked(x, y)) {
        //         return Math.max(value - this.forestSightBlock(value), 0);
        //     }
        //     return Math.max(value - 1, 0);
        // }
        // // 視界がふさがれているか
        // isSightBlocked(x, y) {
        //     const terrainTag = this._mapInSight[y][x];
        //     if (terrainTag === 2 || terrainTag === 3) {return true}
        // }
        // // 視界が「森林ブロック」に塞がれた際の処理
        // forestSightBlock(value) {
        //     return this._forestSight ? 1 : Math.max(value - 1, 1);
        // }
        // // ================================================================
        // // 探索済み情報の更新
        // // ================================================================
        // // 視界に入ったマスを「探索済みマス」として登録し、探索情報をアップデートする
        // updataVoidShadowData() {
        //     for (let y = 0; y < this._sightLevelMap.length; y++) {
        //         for (let x = 0; x < this._sightLevelMap[0].length; x++) {
        //             if (this._sightLevelMap[y][x] > 0) {
        //                 // ダンジョンの移動領域内の座標を取得
        //                 const vx = this.sightOriginX() + x;
        //                 const vy = this.sightOriginY() + y;
        //                 $gameFarm.currentDungeon().updateCurrentExplored(vx, vy)
        //             }
        //         }
        //     }
        // }
        // ================================================================
        //
        // 視界データ生成(汎用)                    
        //         
        // ================================================================
        // ================================================================
        // データ更新
        // ================================================================
        updateMapData() {
            if ($gameFarm.isInField()) {
                // this._minX = $gameFarm.minX;
                // this._maxX = $gameFarm.maxX;
                // this._minY = $gameFarm.minY;
                // this._maxY = $gameFarm.maxY;
                this._minX = 0;
                this._maxX = $gameMap.width() - 1;
                this._minY = 0;
                this._maxY = $gameMap.height() - 1;
            } else
            if ($gameFarm.isInDungeon()) {
                const mapWidth = $gameMap.width();
                const dungeonWidth = $gameFarm.currentDungeon().currentSize()[0];
                const mapHight = $gameMap.height();
                const dungeonHeight = $gameFarm.currentDungeon().currentSize()[1];
                this._minX = (mapWidth - dungeonWidth) / 2;
                this._maxX = this._minX + dungeonWidth;
                this._minY = (mapHight - dungeonHeight) / 2;
                this._maxY = this._minY + dungeonHeight;
            }
        }
        // ================================================================
        // データ
        // ================================================================
        // 視界になりうる範囲のうち最小の座標
        sightMinX() {
            return Math.max($gamePlayer.x - this._sightRange, this._minX);
        }
        sightMaxX() {
            return Math.min($gamePlayer.x + this._sightRange, this._maxX);
        }
        // 視界になりうる範囲のうち最大の座標
        sightMinY() {
            return Math.max($gamePlayer.y - this._sightRange, this._minY);
        }
        sightMaxY() {
            return Math.min($gamePlayer.y + this._sightRange, this._maxY);
        }
        // 視界になりうる範囲のうち最小/最大の座標を更新
        // ================================================================
        // 生成処理
        // ================================================================
        // 視界になりうる範囲の座標を集める
        createTileMapInSight() {
            this._mapInSight = [];
            // for (let y = this.sightMinY(); y <= this.sightMaxY(); y++) {
            //     const tileList = [];
            //     for (let x = this.sightMinX(); x <= this.sightMaxX(); x++) {
            //         tileList[tileList.length] = [x, y];
            //     }
            //     this._mapInSight[this._mapInSight.length] = tileList;
            // }
            const range = this._sightRange;
            for (let i = 0; i < range * 2 + 1; i++) {
                this._mapInSight[i] = [];
                for (let j = 0; j < range * 2 + 1; j++) {
                    let x = $gamePlayer.x - range + j;
                    if (x < 0 || x >= $gameMap.width()) {x = -1};
                    let y = $gamePlayer.y - range + i;
                    if (y < 0 || y >= $gameMap.height()) {y = -1};
                    this._mapInSight[i][j] = [x, y];
                }
            }
        }
        // 視界レベルマップを作る
        createSightData() {
            this.checkSight();
            this._tempSightLevelMap = this._reachedMap.map((v) => {
                return v.map((w) => {
                    if (w >= 2) {
                        return 2; //経路２本以上あったら視界内
                    } else if (w >= 0.75) {
                        return 1; //経路1本だったら半視界内
                    } else {
                        return 0; //経路0本だったら視界外
                    }   
                })     
            })
        }
        // 視線がどれほど届くのか
        // checkSight() {
        //     //空白のリンクマップを生成
        //     this._reachedMap = Array.from({length: this._mapInSight.length}, () => Array(this._mapInSight[0].length).fill(0));
        //     const range = this._sightRange;
        //     this._reachedMap[range][range] = 2;
        //     //チェック開始
        //     this._newTile = [[range, range]];
        //     for (let i = 0; i < range; i++) {
        //         const tile = [...new Set(this._newTile.map(JSON.stringify))].map(JSON.parse);
        //         this._newTile = [];
        //         for (const v of tile) {
        //             if (this.isInSight(v[0], v[1])) {
        //                 this.checkSightEach(v[0], v[1]);
        //             }
        //         }
        //     }
        // }
        inSightXy() {
            for (let y = 0; y < this._mapInSight.length; y++) {
                const x = this._mapInSight[y].findIndex((v) => {return v[0] === $gamePlayer.x && v[1] === $gamePlayer.y});
                if (x >= 0) {
                    return {x: x, y: y};
                }
            }
        }
        // 隣のマスに視線が届くのか
        // checkSightEach(x, y, value) {
        //     const tile = this._mapInSight[y][x];
        //     const tileX = tile[0];
        //     const tileY = tile[1];
        //     const pX = $gamePlayer.x;
        //     const pY = $gamePlayer.y;

        //     // プレイヤーとは反対方向の隣のマスを収集していく
        //     // ただしプレイヤーと同一直線状の場合(x座標あるいはy座標が一致している場合)は、３方向を収集する
        //     const coAry = [];
        //     if (tileX - pX >= 0 && tileY - pY >= 0) {
        //         coAry.push([x + 1, y]);
        //         coAry.push([x, y + 1]);
        //     }
        //     if (tileX - pX >= 0 && tileY - pY <= 0) {
        //         coAry.push([x + 1, y]);
        //         coAry.push([x, y - 1]);
        //     }
        //     if (tileX - pX <= 0 && tileY - pY >= 0) {
        //         coAry.push([x - 1, y]);
        //         coAry.push([x, y + 1]);
        //     }
        //     if (tileX - pX <= 0 && tileY - pY <= 0) {
        //         coAry.push([x - 1, y]);
        //         coAry.push([x, y - 1]);
        //     }
        //     for (let i = 0; i < coAry.length; i++) {
        //         const nX = coAry[i][0];
        //         const nY = coAry[i][1];
        //         if (this.isInSight(nX, nY)) {//隣が存在しているか
        //             const nTile = this._mapInSight[nY][nX];
        //             const nTileX = nTile[0];
        //             const nTileY = nTile[1];
        //             const nextSightLv = this.nextSight(tileX, tileY, nTileX, nTileY, value);
        //             if(nextSightLv > 0) { //光のレベルが0より上の場合は隣のマスもまだ見える
        //                 // this._reachedMap[nY][nX] = Math.max(nextSightLv, this._reachedMap[nY][nX]);
        //                 this._reachedMap[nY][nX] += 1;
        //                 this._newTile.push([nX, nY, nextSightLv]);
        //             }
        //         }
        //     }
        // }
        checkSightEach(x, y) {
            const tile = this._mapInSight[y][x];
            const tileX = tile[0];
            const tileY = tile[1];
            const pX = $gamePlayer.x;
            const pY = $gamePlayer.y;

            // プレイヤーとは反対方向の隣のマスを収集していく
            // ただしプレイヤーと同一直線状の場合(x座標あるいはy座標が一致している場合)は、３方向を収集する
            const coAry = [];
            if (tileX - pX >= 0 && tileY - pY >= 0) {
                if (this.isPassable(x, y, 6)) {coAry.push([x + 1, y])};
                if (this.isPassable(x, y, 2)) {coAry.push([x, y + 1])};
            }
            if (tileX - pX >= 0 && tileY - pY <= 0) {
                if (this.isPassable(x, y, 6)) {coAry.push([x + 1, y])};
                if (this.isPassable(x, y, 8)) {coAry.push([x, y - 1])};
            }
            if (tileX - pX <= 0 && tileY - pY >= 0) {
                if (this.isPassable(x, y, 4)) {coAry.push([x - 1, y])};
                if (this.isPassable(x, y, 2)) {coAry.push([x, y + 1])};
            }
            if (tileX - pX <= 0 && tileY - pY <= 0) {
                if (this.isPassable(x, y, 4)) {coAry.push([x - 1, y])};
                if (this.isPassable(x, y, 8)) {coAry.push([x, y - 1])};
            }
            for (let i = 0; i < coAry.length; i++) {
                const nX = coAry[i][0];
                const nY = coAry[i][1];
                if (this.isInSight(nX, nY)) {
                    const nTile = this._mapInSight[nY][nX];
                    if (this.isSightHalfBlocked(tileX, tileY)) { // 今のマスが茂み
                        this._reachedMap[nY][nX] += 0.5;
                    } else { // 今のマスは茂みではない
                        if (this.isSightHalfBlocked(nTile[0], nTile[1])) {
                            this._reachedMap[nY][nX] += this._reachedMap[y][x] / 4;
                        } else {
                            this._reachedMap[nY][nX] += this._reachedMap[y][x] / 2;
                        }
                    }
                    if (this._reachedMap[nY][nX] > 1) {
                        this._newTile.push([nX, nY]);
                    }
                    // this._newTile.push([nX, nY]);
                }
            }
        }
        // 視界になりうる範囲(一片を視界の長さ*2 + 1とする四角形の範囲)の中かどうか
        isInSight(param1, param2) {
            const width = this._sightRange * 2 + 1;
            if (param2 >= 0 && param2 < width) {
                if (param1 >= 0 && param1 < width) {
                    return true
                }
            }
            return false;
            // const nTile = this._mapInSight[param2][param1];
            // return nTile[0] > 0 && nTile[1] > 0;
        }
        // 隣に届く視界のレベル
        // nextSight(fromX, fromY, toX, toY, value) {
        //     if (toX >= 0 && toY >= 0) {
        //         if (this.isConnected(fromX, fromY, toX, toY)) {
        //             if (this.isSightHalfBlocked(toX, toY)) {
        //                 return value - 1 > 0 ? 1 : 0;
        //             }
        //             return Math.max(value - 1, 0);
        //         }
        //     }
        //     return 0;
        // }
        // 指定した方向の隣のノードと繋がっているか検証
        // isConnected(fromX, fromY, toX, toY) {
        //     const direction = this.direction(fromX, fromY, toX, toY);
        //     return $gameMap.isPassable(toX, toY, direction);
        // }
        isPassable(x, y, d) {
            const tile = this._mapInSight[y][x];
            const tileX = tile[0];
            const tileY = tile[1];
            const pX = $gamePlayer.x;
            const pY = $gamePlayer.y;
            return $gameMap.isPassable(tileX, tileY, d);
            // if ($gameMap.isPassable(tileX, tileY, d)) { // そもそも通行できるか
            //     // 茂みだったら、プレイヤーとのx距離, y距離が短い方のみ光を通す
            //     if (this.isSightHalfBlocked(tileX, tileY)) {
            //         if (Math.abs(tileX - pX) > Math.abs(tileY - pY)) { // x距離のほうが遠い場合
            //             if ([2, 8].includes(d)) {
            //                 return true;
            //             }
            //         } else 
            //         if (Math.abs(tileX - pX) < Math.abs(tileY - pY)) { // y距離のほうが遠い場合
            //             if ([4, 6].includes(d)) {
            //                 return true;
            //             }
            //         } else { // 同じ場合
            //             return true
            //         }
            //     } else { // 茂みじゃなかったら通す
            //         return true
            //     }
            // }
            // return false;
        }
        isSightHalfBlocked(x, y) {
            const tile = this._mapInSight[y][x];
            const tileX = tile[0];
            const tileY = tile[1];
            return $gameMap.isBush(tileX, tileY);
        }
        // 今いる座標から隣の座標への向き
        direction(fromX, fromY, toX, toY) {
            const dx = toX- fromX;
            const dy = toY- fromY;
            if (dy === 1) { // 下
                return 8;
            } else
            if (dx === -1) { // 左
                return 6;
            } else
            if (dx === 1) { // 右
                return 4;
            } else
            if (dy === -1) { // 上
                return 2;
            }
        }
        // ================================================================
        //
        // 絶対値距離-1の視界から逆算するタイプの処理                     
        //         
        // ================================================================
        checkSight() {
            //空白のリンクマップを生成
            this._reachedMap = Array.from({length: this._mapInSight.length}, () => Array(this._mapInSight[0].length).fill(0));
            const range = this._sightRange;
            this._reachedMap[range][range] = 2;
            for (let d = 1; d < range; d++) {
                this.createIndexOnDistance(d);
                for (const index of this._indexOnDistance) {
                    this._reachedMap[index[1]][index[0]] = this.sightLevel(index[0], index[1]);
                }
            }
        }
        // ある絶対値距離のタイルを収集する
        createIndexOnDistance(value) {
            this._indexOnDistance = [];
            const centerX = this._sightRange;
            const centerY = this._sightRange;
            // y座標を基準に、絶対値距離valueのタイルのリストを作成する
            for (let dy = - value; dy <= value; dy++) {
                this._indexOnDistance.push([centerX + (value - Math.abs(dy)), centerY + dy]);
                this._indexOnDistance.push([centerX - (value - Math.abs(dy)), centerY + dy]);
            }
            this._indexOnDistance = [...new Set(this._indexOnDistance.map(JSON.stringify))].map(JSON.parse)
        }
        sightLevel(x, y) {
            // this._mapInSight
            // this._reachedMap
            const px = this._sightRange;
            const py = this._sightRange;
            let index1, index2;
            if (Math.sign(px - x)) { // x距離が0より上か
                const d = px - x > 0 ? 4 : 6;
                index1 = [x + Math.sign(px - x), y, d];
            } else { // x距離が0
                const d = py - y > 0 ? 8 : 2;
                index1 = [x, y + Math.sign(py - y), d];
            }
            if (Math.sign(py - y)) { // y距離が0より上か
                const d = py - y > 0 ? 8 : 2;
                index2 = [x, y + Math.sign(py - y), d];
            } else { // y距離が0
                const d = px - x > 0 ? 4 : 6;
                index2 = [x + Math.sign(px - x), y, d];
            }
            // 視界レベル
            const sight1 = this._reachedMap[index1[1]][index1[0]];
            const sight2 = this._reachedMap[index2[1]][index2[0]];
            if (sight1 <= 1 && sight2 <= 1) {
                // どっちの視界レベルも1以下
                return 0;
            } else {
                let value = 0;
                // index = [x, y, d];
                if (this.isPassable(...index1) && !this.isSightHalfBlocked(index1[0], index1[1])) {
                    value += sight1 / 2;
                }
                if (this.isPassable(...index2) && !this.isSightHalfBlocked(index2[0], index2[1])) {
                    value += sight2 / 2;
                }
                if (this.isSightHalfBlocked(index1[0], index1[1]) || this.isSightHalfBlocked(index2[0], index2[1])) {
                    value = 1;
                    if (this.isSightHalfBlocked(x, y)) {
                        if (Math.abs(px - x) > 1 || Math.abs(py - y) > 1) {
                            value = 0;
                        }
                    }
                }
                if (this.isSightHalfBlocked(x, y)) {
                    value = 1;
                    if (!this.isPassable(...index1) || !this.isPassable(...index2)) {
                        value = 0;
                    }
                }
                return Math.round(value);
            }
        }
        // ================================================================
        //
        // 図形的処理              
        //         
        // ================================================================
        // checkSight() {
        //     //空白のリンクマップを生成
        //     this._reachedMap = Array.from({length: this._mapInSight.length}, () => Array(this._mapInSight[0].length).fill(2));
        //     const range = this._sightRange;
        //     for (let d = 1; d <= range; d++) {
        //         this.createIndexOnDistance(d);
        //         for (const index of this._indexOnDistance) {
        //             this.createShadow(index[0], index[1]);
        //         }
        //     }
        // }
        // // ある距離のタイルを収集
        // createIndexOnDistance(value) {
        //     this._indexOnDistance = [];
        //     const centerX = this._sightRange;
        //     const centerY = this._sightRange;
        //     // x座標を基準に、距離valueのタイルのリストを作成する
        //     for (let dy = - value; dy <= value; dy++) {
        //         if (Math.abs(dy) === value) {
        //             for (let dx = - value; dx <= value; dx++) {
        //                 if (this._reachedMap[centerY + dy][centerX + dx]) {
        //                     this._indexOnDistance.push([centerX + dx, centerY + dy]);
        //                 }
        //             }
        //         } else {
        //             if (this._reachedMap[centerY + dy][centerX - value]) {
        //                 this._indexOnDistance.push([centerX - value, centerY + dy]);
        //             }
        //             if (this._reachedMap[centerY + dy][centerX + value]) {
        //                 this._indexOnDistance.push([centerX + value, centerY + dy]);
        //             }
        //         }
        //     }
        // }
        // // 遮蔽があったとき、影を作る
        // createShadow(x, y) {
        //     const range = this._sightRange;
        //     const centerX = this._sightRange;
        //     const centerY = this._sightRange;
        //     const d = this.direction(centerX, centerY, x, y);
        //     if (!this.isPassable(x, y, d) || !this.isSightHalfBlocked(x, y)) {
        //         console.log([x, y])
        //         // あるタイルが遮蔽タイルの時、視界上の端になる角の座標２つをもとめる
        //         const cornerY1 = (x > range && y < range) || (x < range && y > range) ? y : y + 1;
        //         const cornerY2 = (x > range && y < range) || (x < range && y > range) ? y + 1 : y;
        //         const corner1 = [x, cornerY1];
        //         const corner2 = [x + 1, cornerY2];
        //         // 視界が遮られる範囲の角度をもとめる
        //         const degree1 = this.degree(corner1[0], corner1[1]);
        //         const degree2 = this.degree(corner2[0], corner2[1]);
        //         // 影を生成する範囲の端(影の端の直線の切片の座標)を取得
        //         const edge1 = this.edge(x, y, degree1);
        //         const edge2 = this.edge(x, y, degree2);
        //         // 影を生成
        //         for (let dy = Math.min(edge1[1], edge2[1], centerY); dy < Math.max(edge1[1], edge2[1], centerY); dy++) {
        //             this.createShadowInRow(dy, degree1, degree2);
        //         }
        //     }
        // }
        // // 視界が遮られる範囲の角度をもとめる
        // degree(x, y) { // x / y
        //     const centerX = this._sightRange + 0.5;
        //     const centerY = this._sightRange + 0.5;
        //     return (centerX - x) / (centerY - y);
        // }
        // // 影を生成する範囲の端を取得
        // edge(x, y, degree) {
        //     const range = this._sightRange;
        //     const centerX = this._sightRange + 0.5;
        //     const centerY = this._sightRange + 0.5;
        //     if (Math.abs(degree) <= 1) {
        //         const edgeY = Math.round(centerY + Math.sign(y - centerY) * range);
        //         const edgeX = Math.round(degree * edgeY + (1 - degree) * this._sightRange);
        //         return [edgeX, edgeY];
        //     } else {
        //         const edgeX = Math.round(centerX + Math.sign(x - centerX) * range);
        //         const edgeY = Math.round((edgeX + (degree - 1) * range) / degree);
        //         return [edgeX, edgeY];
        //     }
        // }
        // equationProp(degree) {
        //     return {degree: degree, intercept: (1 - degree) * this._sightRange};
        // }
        // xFromEquation(y, degree) {
        //     return Math.floor(degree * y + (1 - degree) * this._sightRange);
        // }
        // createShadowInRow(dy, degree1, degree2) {
        //     const end = this._sightRange * 2;
        //     const minX = Math.min(Math.max(this.xFromEquation(dy, degree1), 0), Math.max(this.xFromEquation(dy, degree2), 0));
        //     const maxX = Math.max(Math.min(this.xFromEquation(dy, degree1), end), Math.min(this.xFromEquation(dy, degree2), end));
        //     this._reachedMap[dy].fill(0, minX, maxX)
        //     if (minX > 0) {
        //         this._reachedMap[dy][minX] = Math.max(this._reachedMap[dy][minX] - 1, 0);
        //     }
        //     if (minX < end) {
        //         this._reachedMap[dy][maxX] = Math.max(this._reachedMap[dy][maxX] - 1, 0);
        //     }
        // }
    }

    // ================================================================
    //
    // 影描画                             
    //         
    // ================================================================
    // 汎用的な処理を目指す
    // 影描画用のデータをまとめて作る
    // それをSprite_SightShadowに渡す

    const SHADOW_RGBA_LIST = JSON.parse(params.SHADOW_RGBA_LIST);

    class GTT_Shadow {
        constructor() {
            this._mapWidth = $gameMap.width();
            this._mapHeight = $gameMap.height();
            this._tileWidth = $gameMap.tileWidth();
            this._tileHeight = $gameMap.tileHeight();
            this._dungeonSight = 0;
            this._fieldSight = 0;
            this._sightLevelMap = [];
            this._rgbaList = SHADOW_RGBA_LIST;
            this._dungeonXy = [0, 0];
        }
        // ================================================================
        // ダンジョンデータ
        // ================================================================
        dungeon() {
            const xy = this._dungeonXy;
            return $gameFarm.dungeonData(xy[0], xy[1]);
        }
        currentDungeon() {
            return $gameFarm.currentDungeon();
        }
        // ================================================================
        // 影描画のための視界データ
        // ================================================================
        // プレイヤーの視界(暫定的な処理)
        playerSight() {
            if ($gameFarm.isInDungeon()) {
                return this._dungeonSight || 2;
            } else
            if ($gameFarm.isInField()) {
                return this._fieldSight || 3;
            }
        }
        // フィールド上の視界射程
        fieldSight() {
            return this._fieldSight;
        }
        // フィールド上の視界射程を設定する
        setFieldSight(value) {
            this._fieldSight = Math.max(value, 0);
        }
        // ダンジョン内の視界射程
        dungeonSight() {
            return this._dungeonSight;
        }
        // ダンジョン内の視界射程を設定する
        setDungeonSight(value) {
            this._dungeonSight = Math.max(value, 0);
        }
        // ダンジョンのサイズ
        dungeonWidth() {
            if ($gameFarm.isInDungeon()) {
                return this.currentDungeon().currentSize()[0];
            } else
            if ($gameFarm.isInField()) {
                return 0;
            }
        }
        dungeonHeight() {
            if ($gameFarm.isInDungeon()) {
                return this.currentDungeon().currentSize()[1];
            } else
            if ($gameFarm.isInField()) {
                return 0;
            }
        }
        // ================================================================
        // 影描画のための座標
        // ================================================================
        //マップの画面上の幅
        dungeonScreenWidth() {
            return this.dungeonWidth() * this._tileWidth; //マップの画面上の幅
        }
        //マップの画面上の幅
        dungeonScreenHeight() {
            return this.dungeonHeight() * this._tileHeight; //マップの画面上の幅
        }
        // 移動可能領域の原点の画面上のx座標  + 4
        originMapScreenX(){
            if ($gameFarm.isInDungeon()) {
                return (Graphics.boxWidth + 8 - this.dungeonWidth() * this._tileWidth) / 2;
            } else
            if ($gameFarm.isInField()) {
                return (Graphics.boxWidth + 8 - this._tileWidth) / 2 % this._tileWidth;
            }
        }
        // 移動可能領域の原点の画面上のy座標 + 4
        originMapScreenY (){
            if ($gameFarm.isInDungeon()) {
                return (Graphics.boxHeight + 8 - this.dungeonHeight() * this._tileHeight) / 2;
            } else
            if ($gameFarm.isInField()) {
                return (Graphics.boxHeight + 8 - this._tileHeight) / 2 % this._tileHeight;
            }
        }
        // 視界の原点の画面上のx座標
        originSightScreenX() {
            // const distance = Math.max($gamePlayer.sight().inMapCharacterX() - $gameFarm.sightRange(), 0) * this._tileWidth + this._tileWidth / 2;
            // return $gamePlayer.screenX() - distance;
            return this.originMapScreenX() + Math.max($gamePlayer.sight().inMapCharacterX() - $gameFarm.sightRange(), 0) * this._tileWidth;
            return this.originMapScreenX() + Math.max($gamePlayer.sight().inScreenCharacterX() - $gameFarm.sightRange(), 0) * this._tileWidth;
        }
        // 視界の原点の画面上のy座標
        originSightScreenY() {
            // const distance = Math.max($gamePlayer.sight().inMapCharacterY() - $gameFarm.sightRange(), 0) * this._tileHeight + this._tileHeight / 2 - 6;
            // return $gamePlayer.screenY() - distance;
            return this.originMapScreenY() + Math.max($gamePlayer.sight().inMapCharacterY() - $gameFarm.sightRange(), 0) * this._tileHeight;
            return this.originMapScreenY() + Math.max($gamePlayer.sight().inScreenCharacterY() - $gameFarm.sightRange(), 0) * this._tileHeight;
        }
        // // 視界領域の原点の画面上のx座標 + 4
        // inSightOriginScreenX() {
        //     return ((Graphics.boxWidth - this._mapWidth * this._tileWidth) / 2 + (this.dungeonOriginX() + Math.max($gamePlayer.inMapCharacterX() - this.playerSight(), 0)) * this._tileWidth);
        // }
        // // 視界領域の原点の画面上のy座標 + 4
        // inSightOriginScreenY() {
        //     return ((Graphics.boxHeight - this._mapHeight * this._tileHeight) / 2 + (this.dungeonOriginY() + Math.max($gamePlayer.inMapCharacterY() - this.playerSight(), 0)) * this._tileHeight);
        // }
        // // 視界の画面上の幅
        // inSightScreenWidth() {
        //     return this.sightW() * this._tileWidth;
        // }
        // // 視界の画面上の高さ
        // inSightScreenHeight() {
        //     return this.sightH() * this._tileHeight;
        // }
        // ================================================================
        // 影のデータ
        // ================================================================
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
        // ================================================================
        // 影の更新
        // ================================================================
        updataShadow() {
            // 影の更新
            this.updataSight();
        }
        // // 影のアップデート
        updataSight() {
            // 影マップ生成
            this._sightLevelMap = $gamePlayer.sight().currentSightLevelMap();
            if($gameFarm.isInDungeon()) {this.updataVoidShadowData();}
        }
        // ================================================================
        // 探索済み情報の更新
        // ================================================================
        // 視界に入ったマスを「探索済みマス」として登録し、探索情報をアップデートする
        updataVoidShadowData() {
            for (let y = 0; y < this._sightLevelMap.length; y++) {
                for (let x = 0; x < this._sightLevelMap[0].length; x++) {
                    if (this._sightLevelMap[y][x] > 0) {
                        // ダンジョンの移動領域内の座標を取得
                        const vx = $gamePlayer.sight()._dungeonOriginX + x;
                        const vy = $gamePlayer.sight()._dungeonOriginY + y;
                        // 到達済み情報の更新
                        const stage = $gameFarm.currentStage() - 1;
                        $gameFarm.currentDungeon().updataExplored(stage, vx, vy);
                    }
                }
            }
        }
        // ================================================================
        // イベントの可視性
        // ================================================================
        updateEventsVisibility() {
            const visibleTileList = $gamePlayer.visibleTileList();
            $gameMap.updateEventsVisibility(visibleTileList);
        }
    }

    // ================================================================
    // 
    // Game_Characterの追加定義
    // 
    // ================================================================

    const _Game_Character_initialize = Game_Character.prototype.initialize;
    Game_Character.prototype.initialize = function() {
        _Game_Character_initialize.apply(this, arguments);
        // this._characterSight = null;
        this._sight = new GTT_Sight();
    }

    Game_Character.prototype.sight = function() {
        return this._sight;
    }

    // 視界が設定されていない場合の視界
    Game_Character.prototype.characterSight = function() {
        return this._characterSight;
    }

    // 視界が設定されていない場合の視界
    Game_Character.prototype.setCharacterSight = function(value) {
        this._characterSight = value;
    }

    // ================================================================
    //
    // Game_Playerの追加定義                            
    //         
    // ================================================================

    const _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        _Game_Player_initialize.apply(this, arguments);
        this._lastX = 0;
        this._lastY = 0;
        this._sight.setCharacterId(-1);
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
        // $gameFarm.updateFieldEvents();
        // $gameMap.updateEventsVisibility();
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

    // ================================================================
    //
    // Game_Eventの追加定義                            
    //         
    // ================================================================

    // 新たに生成するイベントのリストを取得
    // 新たに生成するイベントのリスト分の共通イベント素体を確保
    // 共通イベントを配置
    // 配置した共通イベントのidリストを作成
    // イベントのアクティブ状態/タグをセット
    // イベントの画像設定データをセット

    // イベントがランドマークイベントか判定
    // イベントがアクティブ範囲内か判定
    // アクティブ範囲外のイベントを0, 0に移動
    // 同時に画像設定データをクリア
    
    // アクティブ状態に変化があったイベントのみ、透明状態の変更及びイベント画像の変更処理を行う

    // フィールドイベントを初期化
    Game_Event.prototype.initGttEvent = function() {
        this._active = false;
        this._role = "";
        // this._visibility = false;
        this._found = false;
        this._characterSight = 0;
    }

    // ================================================================
    // データ
    // ================================================================

    // ランドマークかどうか
    Game_Event.prototype.isLandmarkEvent = function() {
        return this.role() === LANDMARK_TAG;
        // return this.fieldEventTag() === LANDMARK_TAG;
    }

    // フィールドイベントか
    Game_Event.prototype.isFieldEvent = function() {
        return $dataFieldEvent.isBuildingRole(this.role());
    }

    // 使用できる基盤イベントか
    Game_Event.prototype.isBaseEvent = function() {
        return !this.isActive() && !this.isLandmarkEvent();
    }

    // イベントがアクティブ常態かどうか
    Game_Event.prototype.isActive = function() {
        return this._active;
    }

    // イベントのアクティブ状態をセット
    Game_Event.prototype.setActive = function(boolean) {
        this._active = Boolean(boolean);
    }

    // // フィールドイベントタグの取得
    // Game_Event.prototype.fieldEventTag = function() {
    //     return this._fieldEventTag;
    // }

    // // フィールドイベントタグの設定
    // Game_Event.prototype.setFieldEventTag = function(value) {
    //     this._fieldEventTag = value;
    // }

    // // フィールドイベントタグの初期化
    // Game_Event.prototype.clearFieldEventTag = function() {
    //     this._fieldEventTag = null;
    // }

    // role
    Game_Event.prototype.role = function() {
        return this._role;
    }

    Game_Event.prototype.setRole = function(value) {
        this._role = value;
    }

    Game_Event.prototype.clearRole = function() {
        this._role = "";
    }

    // 発見済みか
    Game_Event.prototype.isFound = function() {
        return $gameFarm.fieldEvents()[this._fieldEventId].found();
    }

    // 見た目初期化
    Game_Event.prototype.clearImage = function() {
        this._characterName = "";
        this._characterIndex = 0;
        this._direction = 2;
        this._transparent = false;
    }

    // ================================================================
    // 敵性キャラクターの行動                               
    // ================================================================
    // 敵イベントの行動 
    Game_Event.prototype.enemyAction = function(args) {
        if (this.fieldEventTag === "enemy_character") {
            const visibleTileList = this.visibleTileList();
            // 視界内にプレイヤーがいるかどうか
            const isPlayerInSight = visibleTileList.find((v) => {return v[0] === $gamePlayer.x && v[1] === $gamePlayer.y});
            // いたらプレイヤーのほうへ移動
            if (isPlayerInSight) {this.moveTowardCharacter($gamePlayer)}
        }
    }

    // ================================================================
    // ダンジョンイベント
    // ================================================================
    // // フィールドイベントを初期化
    // Game_Event.prototype.initDungeonEvent = function() {
    //     this._active = false;
    //     this._dungeonEventTag = null;
    //     this._imageData = ["!error", 0, 0];
    //     this._isImageDataChanged = true;
    //     this._visibility = false;
    //     this.setCharacterSight(0);
    // }

    // // フィールドイベントタグの取得
    // Game_Event.prototype.dungeonEventTag = function() {
    //     return this._dungeonEventTag;
    // }

    // // フィールドイベントタグの設定
    // Game_Event.prototype.setDungeonEventTag = function(value) {
    //     this._dungeonEventTag = value;
    // }

    // // フィールドイベントタグの初期化
    // Game_Event.prototype.clearDungeonEventTag = function() {
    //     this._dungeonEventTag = null;
    // }

    // ================================================================
    // スポーン/デスポーンに共通の処理
    // ================================================================



    // ================================================================
    // スポーン
    // ================================================================

    // フィールドイベント/ダンジョン内イベントの見た目反映
    Game_Event.prototype.spawn = function(value) {
        // フィールドイベントのプロパティを用意
        this.initGttEvent();
        // アクティブ化する
        this.setActive(true);
        // フィールドイベントIDの設定
        this._fieldEventId = value;
        const eventData = $gameFarm.fieldEvents()[this._fieldEventId];
        // イベントを配置する
        this.locate(eventData.x, eventData.y);
        // イベントの設定
        this.setFieldEventData();
    }

    Game_Event.prototype.setFieldEventData = function() {
        const eventData = $gameFarm.fieldEvents()[this._fieldEventId].eventData();
        // ロールを設定
        this.setRole(eventData.role);
        // イベント画像の設定
        const detailOption = eventData.detailOptions[0];
        this.setImage(detailOption.characterImage, detailOption.charaImgIndex);
        // イベントの向きの設定
        this.setDirectionFix(false);
        this.setDirection(detailOption.direction);
        this.setDirectionFix(true);
        // 透明化
        // this.setTransparent(true);
    }

    // イベントのスポーン
    // Game_Event.prototype.spawn = function(x, y, tag, visibility) {
    //     this.locate(x, y); //共通イベントを配置
    //     this.setActive(true); //アクティブ状態に設定
    //     this.setFieldEventTag(tag); //イベントタグを設定
    //     this.setVisibility(visibility);
    //     this.setEventImageData(); //イベントタグを元に画像情報を設定

    //     // // 画像情報に変更があったことを設定
    //     // this.setImageDataChanged(true);
    //     this.updateEventImage();
    // }

    // ================================================================
    // デスポーン
    // ================================================================

    // フィールドイベント/ダンジョン内イベントの見た目反映
    Game_Event.prototype.despawn = function() {
        if (this.isDespawn()) {
            // 非アクティブ化する
            this.setActive(false);
            // イベントを配置する
            this.locate(0, 0);
            // ロールをクリア
            this.clearRole();
            // イベント画像をクリア
            this.setImage(detailOption.characterImage, detailOption.charaImgIndex);
            // イベントの向きの設定
            this.setDirection(detailOption.direction);
        }
    }

    Game_Event.prototype.isDespawn = function() {
        if (!this.isLandmarkEvent()) { //元々設置されているイベントはデスポーンしない
            const xd = Math.abs($gamePlayer.x - this.x);
            const yd = Math.abs($gamePlayer.y - this.y);
            if (xd > $gameFarm.activeScope() || yd > $gameFarm.activeScope()) {
                return true;
            }
        }
        return false;
    }

    // // イベントのデスポーン時の処理
    // Game_Farm.prototype.eventsDespawn = function() {
    //     const activeScope = ACTIVE_SCOPE;
    //     $gameMap.eventsDespawn(activeScope);
    // }

    // Game_Event.prototype.isDespawn = function(activeScope) {
    //     if (!this.isLandmarkEvent()) { //元々設置されているイベントはデスポーンしない
    //         const xd = Math.abs($gamePlayer.x - this.x);
    //         const yd = Math.abs($gamePlayer.y - this.y);
    //         if (xd > activeScope || yd > activeScope) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }  

    // Game_Event.prototype.despawn = function() {
    //     this.locate(0, 0);
    //     this.setActive(false);
    //     this.clearFieldEventTag();
    //     this.clearEventImageData(); //画像情報をクリア

    //     // // 画像情報に変更があったことを設定
    //     // this.setImageDataChanged(true);
    //     this.updateEventImage();
    // }

    // ================================================================
    // イベント画像の変更
    // ================================================================

    // // 見た目の更新
    // Game_Farm.prototype.updateEventImage = function() {
    //     // if ($gameMap.event(id)) {$gameMap.event(id).updateEventImage()}
    //     $gameMap.updateEventImage();
    // }

    // // 見た目の更新
    // Game_Event.prototype.updateEventImage = function() {
    //     // && this.isImageDataChanged()
    //     if (!this.isLandmarkEvent()) { // 見た目情報に更新があったかどうか
    //         const imageData = this.eventImageData();
    //         this.setImage(imageData[0], imageData[1]) // Game_CharacterBaseのメソッド
    //         this.setDirectionFix(false); // 向き固定解除
    //         this.setDirection(imageData[2]) // Game_CharacterBaseのメソッド
    //         this.setDirectionFix(true); // 向き固定
    //         this.setImageDataChanged(false) // 見た目の更新が終わったことを反映
    //     }
    // }
    
    // // 見た目情報に更新があったかどうか
    // Game_Event.prototype.isImageDataChanged = function() {
    //     return this._isImageDataChanged;
    // }

    // // 見た目情報に更新について設定
    // Game_Event.prototype.setImageDataChanged = function(boolean) {
    //     this._isImageDataChanged = Boolean(boolean);
    // }

    // // イベント画像の取得
    // Game_Event.prototype.eventImageData = function() {
    //     return this._imageData;
    // }

    // // イベント画像の設定
    // Game_Event.prototype.setEventImageData = function() {
    //     const eventData = new fieldEvent(FIELD_EVENTS_LIST.find((v) => {return v.id === this.fieldEventTag()}));
    //     const optionIndex = 0; // 要改修
    //     const image = eventData.detailOptions()[optionIndex].characterImage;//.split("img/characters/")[1];
    //     const index = eventData.detailOptions()[optionIndex].charaImgIndex;
    //     const direction = eventData.detailOptions()[optionIndex].direction;

    //     this._imageData = [image, index, direction];
    // }

    // // イベント画像のクリア
    // Game_Event.prototype.clearEventImageData = function() {
    //     this._imageData = ["!error", null, null];
    // }

    // ================================================================
    // イベントの可視性を更新
    // ================================================================

    Game_Event.prototype.visualize = function() {
        this.setTransparent(false);
        if (this.isFieldEvent()) {
            $gameFarm.fieldEventXy(this.x, this.y).setFound(true);
        }
    }

    // Game_Event.prototype.visibility = function() {
    //     return this._visibility;
    // }

    // Game_Event.prototype.setVisibility = function(boolean) {
    //     this._visibility = Boolean(boolean);
    // }

    // Game_Event.prototype.updateVisibility = function(visibleTileList) {
    //     const isVisible = visibleTileList.some((v) => {return this.x === v[0] && this.y === v[1]});
    //     // いる場合は透明化解除,いない場合は敵のみ透明化する「移動ルートの設定」の引数を作成
    //     if (isVisible) {
    //         // データ上で見えていることにする
    //         this.setVisibility(true);
    //         // フィールドの固有イベントに関しては発見済みかを記録する
    //         if ($gameFarm.isFieldUniqueEvent(this.fieldEventTag())) {
    //             $gameFarm.updateVisibilityOfEachFieldUniqueEvent(this.x, this.y);
    //         }
    //     } else 
    //     if (!isVisible) {
    //         if (this.isCharacterEvent()) {
    //             // データ上で見えていないことにする
    //             this.setVisibility(false); 
    //         }
    //     }
    //     this.applyVisibility();
    // }

    // Game_Event.prototype.isCharacterEvent = function() {
    //     const eventList = $gameFarm.allEventsList();
    //     return eventList.some((v) => {
    //         // イベントの生成元IDあるいは生成元の名前と一致するイベントがイベントリスト内にあるかどうか
    //         if(this.fieldEventTag() === v.id) {
    //             // 敵かどうか
    //             return v.role === "character";
    //         }
    //     })
    // }

    // Game_Event.prototype.applyVisibility = function() {
    //     this.setTransparent(!this.visibility()); // Game_CharacterBaseのメソッドを使用
    // }

    // ================================================================
    //
    // Game_Mapの追加定義                            
    //         
    // ================================================================

    // ================================================================
    // イベントの再利用による軽量化処理
    // ================================================================
    // const _Game_Map_initialize = Game_Map.prototype.initialize;
    // Game_Map.prototype.initialize = function() {
    //     _Game_Map_initialize.apply(this, arguments);
    //     this._spawnOrDespawnEventsIdList = [null];
    // }

    // ================================================================
    // データ
    // ================================================================

    // ある座標に固定のイベントのタグを設定
    Game_Map.prototype.setLandmarks = function() {
        const events = this.events();
        for (let i = 0; i < events.length; i++) {
            // events[i].setFieldEventTag(LANDMARK_TAG);
            // events[i].setActive(true);
            // events[i].setImageDataChanged(false);
            events[i].setRole(LANDMARK_TAG);
            events[i].setActive(true);
        }
    }

    // ================================================================
    // イベント設置前の処理
    // ================================================================
    // 非アクティブ状態のイベントを検索
    Game_Map.prototype.findDeactiveEvent = function() {
        const events = this.events();
        const deactiveEvent = events.find((v) => {return v.isBaseEvent()});
        const id = deactiveEvent ? deactiveEvent.eventId() : -1;
        return id;
    }

    // 非アクティブ状態のイベントの数を取得
    Game_Map.prototype.deactiveEventsNum = function() {
        return this.events().filter((v) => {return v.isBaseEvent()}).length;
    }

    // スポーンしたイベントのidリストを取得
    Game_Map.prototype.lastSpawnEventsList = function() {
        return this._lastSpawnEventsList;
    }

    // スポーン/デスポーンしたイベントのIDリスト
    Game_Map.prototype.spawnOrDespawnEventsIdList = function() {
        return this._spawnOrDespawnEventsIdList;
    }

    // スポーン/デスポーンしたイベントのIDをリストに追加
    Game_Map.prototype.addSpawnOrDespawnEventsIdList = function(id) {
        this._spawnOrDespawnEventsIdList = [...this._spawnOrDespawnEventsIdList, id];
    }

    // スポーン/デスポーンしたイベントのIDリストをクリア
    Game_Map.prototype.clearSpawnOrDespawnEventsIdList = function() {
        this._spawnOrDespawnEventsIdList = [null];
    }

    // ================================================================
    // イベントスポーン後の処理
    // ================================================================
    // Game_Map.prototype.eventSpawn = function(listArg) {
    //     const list = [...listArg];
    //     for (let i = 0; i < list.length; i++) {
    //         if (!list[i]) {continue;} //リストにnullが入ってたら飛ばす
    //         // const x = list[i]._x;
    //         // const y = list[i]._y;
    //         // const tag = list[i]._id;
    //         const x = list[i][0];
    //         const y = list[i][1];
    //         const tag = list[i][2];
    //         const visibility = list[i][3];
    //         // 配置した共通イベントのidリストを作成
    //         const eventId = this.findDeactiveEvent();
    //         // スポーン/デスポーンしたイベントのIDをリストに追加
    //         this.addSpawnOrDespawnEventsIdList(eventId);
    //         // 共通イベントを配置
    //         this.event(eventId).spawn(x, y, tag, visibility);
    //     }
    // }
    Game_Map.prototype.eventsSpawn = function() {
        for (const data of $gameFarm.spawnEvents()) {
            const spawnEvent = this.events().find((event) => {return event.isBaseEvent()});
            spawnEvent.spawn(data.id);
        }
    }

    // イベントのアクティブ状態を更新
    Game_Map.prototype.activateSettingEvents = function() {
        const idList = $gameFarm.tempSpawnEventsIdList();
        for (let i = 0; i < idList.length; i++) {
            if (!idList[i]) {continue;}
            this.event(idList[i]).setActive(true);
        }
    }

    // ================================================================
    // イベント設置後の処理
    // ================================================================
    // 見た目の更新
    Game_Map.prototype.updateEventImage = function() {
        for (let i = 0; i < this.events().length; i++) {
            this.events()[i].updateEventImage();
        }
    }

    // ================================================================
    // イベントデスポーン
    // ================================================================
    Game_Map.prototype.eventsDespawn = function() {
        // 全イベントを取得
        const activeEvents = this.events().filter((event) => {
            return event.isActive();
        })
        for (const event of activeEvents) {
            event.despawn();
        }
        // for (let i = 0; i < this.events().length; i++) {
        //     const eventId = i + 1;
        //     if (this.event(eventId).isDespawn($gameFarm.activeScope())) { //デスポーン条件を満たしているか
        //         // スポーン/デスポーンしたイベントのIDをリストに追加
        //         this.addSpawnOrDespawnEventsIdList(eventId);
        //         this.event(eventId).despawn(); //デスポーン処理
        //     }
        // }
    }

    // ================================================================
    // 可視性の更新
    // ================================================================
    // Game_Map.prototype.updateEventsVisibility = function(visibleTileList) {
    //     for (let i = 0; i < this.events().length; i++) {
    //         this.events()[i].updateVisibility(visibleTileList);
    //     }
    // }
    Game_Map.prototype.updateEventsVisibility = function() {
        // 一旦全部不可視にする
        for (const event of this.events()) {
            if (!event.isLandmarkEvent()) {
                event.setTransparent(true);
            }
            // event.setTransparent(true);
        }
        // 視界内のイベントを可視化
        for (const tile of $gamePlayer.sight().tileInScope()) {
            const id = this.eventIdXy(...tile);
            if (id) {
                this.event(id).visualize();
            }
        }
        // 発見済みなら可視化
        for (const event of this.events()) {
            if (!event.isLandmarkEvent()) {
                if ($gameFarm.fieldEventDataXy(event.x, event.y)._found) {
                    event.setTransparent(false);
                }
            }
        }
        // 発見済みのフィールドイベントを可視化
        const events = this.events().filter((event) => {return event.isFound()});
        for (const event of events) {
            event.visualize();
        }
    }

    // ================================================================
    //
    // 影描画                             
    //         
    // ================================================================
    // 汎用的な処理を目指す
    // ================================================================
    //
    // Spriteset_Mapの追加定義                             
    //         
    // ================================================================

    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.apply(this, arguments);
        this.createSightShadow();
    }

    Spriteset_Map.prototype.createSightShadow = function() {
        const bitmap = new Bitmap(Graphics.boxWidth + $gameMap.tileWidth() * 2, Graphics.boxHeight + $gameMap.tileHeight() * 2);
        this._sightShadow = new Sprite_SightShadow(bitmap);
        this._sightShadow.z = 8.5;
        this._tilemap.addChild(this._sightShadow);
        // this.addChild(this._sightShadow)
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.apply(this, arguments);
        this.updateSightShadow();
    }

    Spriteset_Map.prototype.updateSightShadow = function() {
        this._sightShadow.updateSightShadow();
    }

    // ================================================================
    //
    // Sprite_SightShadow                          
    //         
    // ================================================================
    class Sprite_SightShadow extends Sprite {
        constructor() {
            super(...arguments);
            this._voidShadowRgba = "";
            this._outerShadowRgba = "";
            this._innerShadowRgba = "";
            this._exploredMaps = "";
            this._sightLevelMap = "";
            this._tileWidth = $gameMap.tileWidth();
            this._tileHeight = $gameMap.tileHeight();
            this._outerX = 0;
            this._outerY = 0;
            this._outerWidth = Graphics.boxWidth + 8;
            this._outerHeight =  Graphics.boxHeight + 8;
            this._innerX = 0;
            this._innerY = 0;
            this._voidX = 0;
            this._voidY = 0;
            this._screenCoverWidth = Graphics.boxWidth + 8 + this._tileWidth * 2;
            this._screenCoverHeight = Graphics.boxHeight + 8 + this._tileHeight * 2;
            // this.move(4, 4);
        }
        update() {
            Sprite.prototype.update.call(this);
            this.updatePosition();
        }
        updatePosition() {
            // const tileWidth = $gameMap.tileWidth();
            // const tileHeight = $gameMap.tileHeight();
            // const x = $gamePlayer._realX - 10 - Math.floor($gameMap._displayX);
            // const y = $gamePlayer._realY - 5 - Math.floor($gameMap._displayY);
            this.x = - ($gamePlayer._realX - $gamePlayer.lastX() + 1) * this._tileWidth;
            this.y = - ($gamePlayer._realY - $gamePlayer.lastY() + 1) * this._tileHeight;
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
            this._voidShadowRgba = $gameFarm.shadow().shadowRgba()[0];
            this._outerShadowRgba = $gameFarm.shadow().shadowRgba()[1];
            this._innerShadowRgba = $gameFarm.shadow().shadowRgba()[2];
            // this._outerX = $gameFarm.shadow().originMapScreenX();
            // this._outerY = $gameFarm.shadow().originMapScreenY();
            // this._outerWidth = $gameFarm.shadow().dungeonWidth() * this._tileWidth;
            // this._outerHeight = $gameFarm.shadow().dungeonHeight() * this._tileHeight;
            // this._innerX = $gameFarm.shadow().originSightScreenX() + this._tileWidth;
            // this._innerY = $gameFarm.shadow().originSightScreenY() + this._tileHeight;
            this._innerX = $gamePlayer.screenX() - $gamePlayer.sight().sightRange() * this._tileWidth + this._tileWidth / 2;
            this._innerY = $gamePlayer.screenY() - $gamePlayer.sight().sightRange() * this._tileHeight + 6;
        }
        // 影のアップデート
        updateSightShadow() {
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
        // ================================================================
        // 未到達領域の影
        // ================================================================
        // 移動可能領域外の影を描写
        updateVoidShadow() {
            if (this._exploredMaps) {
                // ダンジョン内
                this.bitmap.fillRect(this._voidX, this._voidY, this._screenCoverWidth, this._screenCoverHeight, this._voidShadowRgba);
                for (let y = 0; y < this._exploredMaps.length; y++) {
                    for (let x = 0; x < this._exploredMaps[0].length; x++) {
                        if (this._exploredMaps[y][x] === 1) { //exploredMap[y][x] === 1 は探索済みを表す
                            const tileW = this._tileWidth;
                            const tileH = this._tileHeight;
                            const sx = this._outerX + x * tileW;
                            const sy = this._outerY + y * tileH;
                            this.bitmap.clearRect(sx, sy, tileW, tileH); //探索済みだったら不透明な影を除去する
                        }
                    }
                }
            } else {
                // フィールド上
                this.bitmap.fillRect(this._voidX, this._voidY, this._screenCoverWidth, this._screenCoverHeight, this._outerShadowRgba);
                this.bitmap.clearRect(this._outerX, this._outerY, this._outerWidth, this._outerHeight)
            }
        }
        // ================================================================
        // 視界外の影
        // ================================================================
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
        // ================================================================
        // 視界内の影
        // ================================================================
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

})()

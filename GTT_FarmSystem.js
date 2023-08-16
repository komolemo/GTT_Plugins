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
 *
 * @param resorceTileListsGTT
 * @text 資源タイル群リスト
 * @desc 資源タイル群の設定
 * @type struct<ResorceTileLists>[]
 * @
 * @param regionZcoListGTT
 * @text Z座標リスト
 * @desc 
 * @type struct<regionZcoList>[]
 * 
 * //================================
 * //  ポイント設置関連
 * //================================
 * 
 * @command CREATE_FARM_POINT_DATA
 * @text 設置
 * @desc 採取ポイントやダンジョンなどを設置
 * 
 * @arg startX
 * @text 始点のx座標
 * @number
 * @desc 設置範囲のx座標の原点
 * 
 * @arg startY
 * @text 始点のy座標
 * @number
 * @desc 設置範囲のy座標の原点
 * 
 * @arg width
 * @text 幅
 * @number
 * @desc 設置範囲の幅
 * 
 * @arg height
 * @text 高さ
 * @number
 * @desc 設置範囲の高さ
 * 
 * @arg value
 * @text 設置数
 * @number
 * @desc 何個設置するか
 * 
 * @arg farmPointData
 * @text 設置イベントリスト
 * @type struct<FarmPointData>[]
 * 
 * //================================
 * //  イベント可視化
 * //================================
 * 
 * @command VISUALIZE_EVENT
 * @text 可視化の準備
 * @desc 視界に入ったイベントを収集
 *
 * @arg sight
 * @text 視界
 * @desc プレイヤーを中心とする視界の幅
 * @default 9
 * 
 * //================================
 * //  ダンジョン侵入・進行
 * //================================
 * 
 * @command PROCEED_DUNGEON
 * @text マップ生成
 * @desc ダンジョン侵入・階層進行時のマップ生成
 *
 * @arg tilesetArray
 * @text タイル
 * @desc ダンジョンを構成するタイルIDの配列
 * @default [3, 1, 2, 0, 4]
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
 @type text
 @desc 設置するイベントの名前
 @
 @param farmPointRate
 @text 出現確率
 @type number
 @desc 設置するイベントの出現確率
*/

(() => {

const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
const params = PluginManager.parameters(pluginName);
const script = document.currentScript;

function random(max, min) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

//タイル探索関係のパラメーター
//const parameterResorceTileArray = JSON.parse(params.resorceTileListsGTT);
//const parameterRegionArray = JSON.parse(params.regionZcoListGTT);

//プラグインコマンド

//採取ポイントを作成するコマンド
PluginManagerEx.registerCommand(script, 'CREATE_FARM_POINT_DATA', args => {
    const arg = args._parameter;
    $gameFarm.createFarmPointList(arg);
})

//イベントが視界内なら可視化するコマンド
PluginManagerEx.registerCommand(script, 'VISUALIZE_EVENT', args => {
    $gameFarm.findFirmPoint();
})

//ダンジョンに入る/階層を進むコマンド
PluginManagerEx.registerCommand(script, 'PROCEED_DUNGEON', args => {
    const tilesetArray = eval(args.tilesetArray)
    $gameFarm.moveNextStage(tilesetArray)
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

//objectでのFarmの追加

function Game_Farm() {
    this.initialize(...arguments);
}

Game_Farm.prototype.initialize = function() {
    this.clear();
}

Game_Farm.prototype.clear = function() {
    this._data = [];
    this._dungeonDataList = {};
    this.clearExploringData();
    this._eventSettingMap = [];
    this._additionalVisibleEventList = [];
    this._shadowData = {};
}

Game_Farm.prototype.array = function() {
    return this._data || 0;
}

Game_Farm.prototype.clearExploringData = function() {
    this._exploringData = {
        _stage:0,
        _dungeonData:{},
    }
}

//採取くじ配列の生成
//resorceTileListGTT : parameterResorceTileArray
//tileArrayGTT : const paramKeyBase = JSON.parse(parameterResorceTileArray[]) const paramTileArray = paramKeyBase["tileArrayGTT"] paramTileArray
//resorceListArray : const paramKeyBase = JSON.parse(parameterResorceTileArray[]) const paramResorceArray = paramKeyBase["resorceListArray"]
//
//
//
//const paramKeyBase = JSON.parse(parameterResorceTileArray[0]);
//const paramResorceArray = paramKeyBase["tileArrayGTT"];
//const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);
//
//const resorceKeyBase = JSON.parse(paramResorceLotObj[0]);
//const paramResorceId = resorceKeyBase["resorceGTT"];
//const paramResorceLotNum = resorceKeyBase["lotNumGTT"];

//指定座標に対応した資源くじ配列を取得
Game_Farm.prototype.farmLot = function(x, y) {    
	for (let layerIdGTT = 1; layerIdGTT <= 4; layerIdGTT++){
        (this.tileTypeGTT($gameMap.tileId(x, y, layerIdGTT)) > 0) ? 
            this.addLotArrayAll(
                this.tileTypeGTT($gameMap.tileId(x, y, layerIdGTT))
        ) : console.log("aaa")  
		}
    return this._data || 0;
}

//資源タイルリストのn番目の資源タイルリスト(オブジェクト)を取得
Game_Farm.prototype.resorceTileList = function(param) {
    const paramKeyBase = JSON.parse(parameterResorceTileArray[param - 1]);
    const paramTileArray = paramKeyBase["tileArrayGTT"]

    return paramTileArray;
}

//あるタイルIDが属している資源タイルID群(タイルタイプ)を取得
Game_Farm.prototype.tileTypeGTT = function(param) {
    let tileTypeGtt = 0;
   for (let loopTileType = 1, foundTileType = false; loopTileType <= parameterResorceTileArray.length && foundTileType === false; loopTileType++){
        tileTypeGtt = loopTileType;
        foundTileType = this.resorceTileList(tileTypeGtt).includes(param);
    }
    if (this.resorceTileList(tileTypeGtt).includes(param) === true) {
        return tileTypeGtt;
    } else {return -1}
};

//ある資源タイルID群に対応する資源リストを全部採取くじ配列に追加する処理(param:タイル群)
Game_Farm.prototype.addLotArrayAll = function(param) {
    console.log(param);
    const paramKeyBase = JSON.parse(parameterResorceTileArray[param - 1]);
    const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);
    console.log(paramResorceLotObj);

    for (let loopAddLotArrayAll = 1; loopAddLotArrayAll <= paramResorceLotObj.length; loopAddLotArrayAll++) {
        console.log(param, loopAddLotArrayAll);
        this.addLotArray(param, loopAddLotArrayAll)
    }
}

//資源タイルID群n番目の資源リストm番目を採取くじ配列に追加する処理
Game_Farm.prototype.addLotArray = function(param1, param2) {
    const paramKeyBase = JSON.parse(parameterResorceTileArray[param1 - 1]);
    const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);

    const resorceKeyBase = JSON.parse(paramResorceLotObj[param2 - 1]);
    const paramResorceId = Number(resorceKeyBase["resorceGTT"]);
    const paramResorceLotNum = Number(resorceKeyBase["lotNumGTT"]);

    this.addLot(paramResorceId, paramResorceLotNum);
}

//採取くじ配列に資源くじを追加する処理(param1:アイテムID, param2:くじの本数)
Game_Farm.prototype.addLot = function(param1, param2) {
    for (let loopAddLot = 1; loopAddLot <= param2; loopAddLot++) {
        this.array().push(param1)
    }
}

//z座標関係//
//z座標関係//

//リージョンのz座標を取得
Game_Farm.prototype.regionZco = function(x, y) {
    const regionId = $gameMap.regionId(x, y);
    let setZco = 0;

    for (let i = 1, foundZco = false; i <= parameterRegionArray.length && foundZco === false; i++) {
        setZco = i;
        foundZco = this.ArrayRegionZco(setZco).includes(regionId)
    }

    console.log( this.zcoRegionZco(setZco) )
    if ( this.ArrayRegionZco(setZco).includes(regionId) ) { return this.zcoRegionZco(setZco) } else { return - 1 };
}

//Z座標リストの一つにに対応するリージョン配列を取得
Game_Farm.prototype.ArrayRegionZco = function(param) {
    const paramKeyBase = JSON.parse(parameterRegionArray[param - 1]);
    const paramRegionArray = paramKeyBase["regionArrayGTT"];

    console.log(paramRegionArray)
    return paramRegionArray;
}

//Z座標リストの一つに対応するz座標を取得
Game_Farm.prototype.zcoRegionZco = function(param) {
    const paramKeyBase = JSON.parse(parameterRegionArray[param - 1]);
    const paramRegionArray = paramKeyBase["regionZcoGTT"];
    return paramRegionArray;
}

/////////////////////////////////
////探索できる建造物/部屋を追加////
/////////////////////////////////

Game_Farm.prototype.createFarmSpace = function(x, y, mapId) {

    const farmSpace = {
        x:x,
        y:y,
        mapId:mapId,
        farmpointList:[],
    }
}

// ================================================================
//
// マップ上に探索ポイントを生成                             
//         
// ================================================================

Game_Farm.prototype.createFarmPointList = function(arg) {
    //2次元配列を作成
    this._eventSettingMap.splice(0);
    //配置するイベントの設定に関する配列を作成
    let farmPointArray = arg.farmPointData.map((value) => {return value._parameter});
    //イベント配置
    this.createFarmPoint(arg.startX, arg.startY, arg.width, arg.height, arg.value, farmPointArray);
}

Game_Farm.prototype.createFarmPoint = function(x, y, width, height, value, array) {
    for (let i = 1; i <= value; i++) {
        //設置する座標を設定
        for (let eventSpawnable = false; eventSpawnable === false;) {
            const setX = random(width - 1, x);
            const setY = random(height - 1, y);

            //設定した座標にイベントを置けるかどうか判定　置けなかったらループ
            const tileArray = $gameMap.layeredTiles(setX, setY);
            if (tileArray[0] === 0 && tileArray[1] === 0 && tileArray[2] === 0) {
                this.addFarmPoint(setX, setY, array);
                eventSpawnable = true;
            }
        }
    }
}

Game_Farm.prototype.addFarmPoint = function(setX, setY, array) {
    //設定した確率に応じてマップ上オブジェクトの情報を格納
    let totalRate = 0;
    for (let i = 0; i < array.length; i++) {
        totalRate += array[i].farmPointRate;
        array[index].goal = totalRate;
    }
    const randomNum = Math.random() * (totalRate + 1) + 1;

    for (let i = 1, boolen = false; i <= array.length && boolen === false; i++) {
        if (randomNum <= array[i-1].goal) {
            const data = this.createFarmPointData(setX, setY, array[i-1].farmPointName);
            this._eventSettingMap.push(data);
            boolen = true;
        }
    }
}

Game_Farm.prototype.createFarmPointData = function(x, y, name, eventId) {
    class event {
        constructor(x, y, name) {
            this.x = x;
            this.y = y;
            this.name = name;
            this.eventId = eventId;
        }
    }

    return new event(x, y, name);
}

Game_Farm.prototype.debug = function() {
    // console.log(aaaaaaa);
}

//視界内のマップ上探索ポイントを検索
Game_Farm.prototype.findFirmPoint = function(sight) {
    this._additionalVisibleEventList.splice(0);

    const direction = $gamePlayer._direction;
    const x = $gamePlayer.x;
    const y = $gamePlayer.y;

    const startX = direction != 6 ? x - sight : x + sight;
    const startY = direction != 2 ? y - sight : y + sight;

    for (let i = 0 ; i < sight ; i++) {
        for (const v of this._eventSettingMap) {
            if (v.x === startX && v.y === startY) {this._additionalVisibleEventList.push(v)}
        }
    }
}

// ================================================================
//
// エリア収縮に関する処理
//
// ================================================================

function maxAreaPhase(n, m) {
    for (let i = 0, end = false; end === false; i++) {
        if ((i + 1) * i / 2 >= n * m) {return i + 1}
    }
}

Game_Farm.prototype.createRingShrinkPlan = function(n, m) {
    const maxPhase = maxAreaPhase(n, m);
    const plan = Array.from({length:m}, () => Array(n));
    //まず最終エリアを決める
    const finalArea = [random(n-1, 0), random(m-1, 0)];
    plan[finalArea[1]][finalArea[0]] = maxPhase;
    //距離ごとのリストを作る
    const distanseList = Array.from({length:(Math.max(n, m) - 1) * 2}, () => Array())
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const xD = Math.abs(j - finalArea[0]);
            const yD = Math.abs(i - finalArea[1]);
            if (xD + yD > 0) {distanseList[xD + yD - 1].push([j, i])};
        }
    }
    console.log(distanseList);
    //次に他のエリアを決める
    // let doNum = 0;
    // distanseList.forEach((value, index) => {
    //     const list = [...value];
    //     for (let i = 0; i < value.length; i++) {
    //         const randomIndex = random(list.length - 1, 0);
    //         const xY = list[randomIndex];
    //         plan[xY[1]][xY[0]] = maxPhase - (index + 1);
    //         list.splice(randomIndex, 1);
    //     }
    // })
    for (let i = 0, dLevel = 0, doNum = 0; i < maxPhase - 1 && doNum < n * m - 1; i++) {
        for (let j = 0; j < i + 1; j++) {
            const index = random(distanseList[dLevel].length - 1, 0) //一つの絶対値距離リストの中から一つを抽出
            const xY = distanseList[dLevel][index];
            plan[xY[1]][xY[0]] = maxPhase - (i + 1);
            distanseList[dLevel].splice(index, 1);
            doNum++;
            if (distanseList[dLevel].length === 0) {dLevel++} //一つの絶対値距離リストを使い切ったら１つ遠い距離のリストに移行する
        }
    }
    return plan;
}

// ================================================================
//
// ダンジョン生成                            
//         
// ================================================================

//ダンジョンに入る＆ダンジョンの階層を進むときの処理
Game_Farm.prototype.moveNextStage = function(tileArray) {
    this._exploringData._stage += 1; //ダンジョンの階層を進む
    this._exploringData._dungeonData = this.getDungeonMapData($gamePlayer.x, $gamePlayer.y); //全体マップの座標に応じたダンジョンデータを取得
    this._exploringData._floorMap = this._exploringData._dungeonData._dungeonMap[this._exploringData._stage - 1];
    this._exploringData._exploredMap = this._exploringData._dungeonData._exploredMap[this._exploringData._stage - 1];
    this.createExploredMapArray(this._exploringData._exploredMap);
    this.createDungeonFloorMapTileData(tileArray, this._exploringData._floorMap);
}

//ダンジョンデータを収めるクラス
class dungeonData {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._scale = 9//5 + random(2, 0) * 2; //要改変
        this._maxLevel = random(3, 1);
        this._dungeonMap = Array.from({length:this._maxLevel}, () => compressLinks($gameFarm.createDungeonFloorMap(this._scale, this._scale)));
        this._exploredMap = createExploredMap(this._dungeonMap);
    }
}

function createExploredMap(array) {
    const exploredMap = array.map((v) => {const oneExploredMap = recreateArray(v).map((w) => {
            return w.fill(0)
        })
        return compressLinks(oneExploredMap);
    })
    return exploredMap;
}

//全体マップ上の座標に対応するダンジョンデータを取得する
Game_Farm.prototype.getDungeonMapData = function(x, y) {
    if (this._dungeonDataList[`X${x}Y${y}`] === undefined) { //座標で管理するために座標をキーとするオブジェクトにダンジョンデータを収納している
        this._dungeonDataList[`X${x}Y${y}`] = new dungeonData(x, y) //ダンジョンは初めて踏み入れるときにデータを生成する
    }
    return this._dungeonDataList[`X${x}Y${y}`];
}

Game_Farm.prototype.setCoordinates = function() {
    if (this._exploringData._stage > 0) {
        this._sight = this._dungeonSight; //視界の設定

        const mapArray = recreateArray(this._exploringData._floorMap);
        //座標を設定
        this._mapW = mapArray[0].length; //移動可能領域の幅
        this._mapH = mapArray.length; //移動可能領域の高さ
    
        this._mapOriginX = Math.floor(($gameMap.width() - this._mapW) / 2); //移動可能領域の原点のx座標
        this._mapOriginY = Math.floor(($gameMap.height() - this._mapH) / 2); //移動可能領域の原点のy座標
    
        this.inMapPlayerX = () => {return $gamePlayer.x - this._mapOriginX}; //移動可能領域内のプレイヤーx座標
        this.inMapPlayerY = () => {return $gamePlayer.y - this._mapOriginY}; //移動可能領域内のプレイヤーy座標
    
        // this.inMapSightOriginX = () => {return Math.max($gamePlayer.x - this._mapOriginX - this._sight)}
    } else if (this._exploringData._stage === 0) {
        this._sight = this._fieldSight; //視界の設定

        //座標を設定
        this._mapW = 19; //移動可能領域の幅
        this._mapH = 11; //移動可能領域の高さ
    
        this._mapOriginX = 0; //移動可能領域の原点のx座標
        this._mapOriginY = 0; //移動可能領域の原点のy座標
    
        this.inMapPlayerX = () => {return 9}; //移動可能領域内のプレイヤーx座標
        this.inMapPlayerY = () => {return 5}; //移動可能領域内のプレイヤーy座標
    }

    this.sightOriginX = () => {return Math.max($gamePlayer.x - this._sight - this._mapOriginX, 0)}; //移動可能領域内の視界の原点のx座標
    this.sightOriginY = () => {return Math.max($gamePlayer.y - this._sight - this._mapOriginY, 0)}; //移動可能領域内の視界の原点のy座標
    
    this.inSightPlayerX = () => {return Math.min(this._sight, this.inMapPlayerX())}; //視界内でのプレイヤーのx座標
    this.inSightPlayerY = () => {return Math.min(this._sight, this.inMapPlayerY())}; //視界内でのプレイヤーのy座標

    //視界の幅
    this.sightW = () => {return Math.min(this.inMapPlayerX() + this._sight, this._mapW - 1) - Math.max(this.inMapPlayerX() - this._sight, 0) + 1};
    //視界の高さ
    this.sightH = () => {return Math.min(this.inMapPlayerY() + this._sight, this._mapH - 1) - Math.max(this.inMapPlayerY() - this._sight, 0) + 1};
}

// ================
// マップ生成
// ================

//ダンジョンマップを生成する(ﾋﾄﾂﾋﾄﾂ修正する版)
Game_Farm.prototype.createDungeonFloorMap = function(n, m) {
    links = this.createTempDungeonFloorMap(n, m); //ランダムでダンジョンマップを生成
    for(isCompleted = false; isCompleted === false;) { //条件に合うマップを生成するまで修正を繰り返す
        const reachedMapM = this.checkConnectivity(links); //全部のノードが繋がっているか検証
        const unreachableTileM = this.getUnreachableTile(reachedMapM); //繋がっていないノードを取得
        if(unreachableTileM.length === 0) { //到達不可能タイルが０だったら完成
            isCompleted = true; //到達不可能タイルが０だったらループを終わらせる
        } else {
            links = this.modifiedMap(links, unreachableTileM); //到達不可能タイルが１以上だったら修正する
        }
    }
    return links;
}

//ランダムでリンクを生成する関数
Game_Farm.prototype.createTempDungeonFloorMap = function(n, m) {
    const links = Array.from({length:m}, () => Array(n).fill(0)); //空白のリンクマップを生成
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {links[i][j] = this.createLink(links, j, i);} //それぞれのノードに対してリンクを生成
    }
    return links;
}

Game_Farm.prototype.createLink = function(links, x, y) {
    const n = links[0].length;
    const m = links.length;
    let linkType = 0;
    if (y > 0) {
        if (x === n - 1 && links[y-1][x] === 0) { // 右端の列で縦２連0の時確定で孤立するのでその回避処理
            linkType += 1;  // 上方向のリンクを追加
        } else {
            linkType += random(100, 1) > 50 ? 1 : 0;  // 上方向のリンクを追加
        }
    }
    if (x > 0) {
        if (y === m - 1 && links[y][x-1] === 0) { // 最下段の行で横２連0の時確定で孤立するのでその回避処理
            linkType += 2;  // 左方向のリンクを追加
        } else {
            linkType += random(100, 1) > 50 ? 2 : 0;  // 左方向のリンクを追加
        }
    }
    if (x === n - 1 && y === m - 1) {linkType = random(3, 1);}
    return linkType;
}

//ノードが全て繋がっているか検証する
Game_Farm.prototype.checkConnectivity = function(links) {
    const n = links[0].length;
    const m = links.length;
    const reachedMap = Array.from({length:m}, () => Array(n).fill(false)); //空白のboolenマップを生成
    this.checkMarginalConnectivity(0, 0, 0, links, reachedMap); //チェック開始
    return reachedMap;
}

//１つのノードが最低一つのつながりを持っているか検証する
Game_Farm.prototype.checkMarginalConnectivity = function(x, y, d, links, reachedMap) {
    reachedMap[y][x] = true;
    const direct = [[1, 0], [0, 1], [-1, 0], [0, -1]]; //方向を格納
    for (let i = 0; i < 3; i++) {
        const tempD = (d + 3 + i) % 4; //反時計回りに90度回転した向きから検証する
        const nX = x + direct[tempD][0]; //隣のx座標を設定
        const nY = y + direct[tempD][1]; //隣のy座標を設定

        if (nX >= 0 && nX < links[0].length && nY >= 0 && nY < links.length) {//隣が存在しているか
            if (reachedMap[nY][nX] != true) {//隣に到達済みか
                if (this.isConnected(x, y, nX, nY, links)) {//隣あるいは現在のノードの条件
                    this.checkMarginalConnectivity(nX, nY, tempD, links, reachedMap);
                }
            }
        }
    }
}

//指定した方向の隣のノードと繋がっているか検証
Game_Farm.prototype.isConnected = function(fromX, fromY, toX, toY, links) {
    let subX = toX - fromX > 0 || toY - fromY > 0 ? toX : fromX; //隣のノードのx座標を取得
    let subY = toX - fromX > 0 || toY - fromY > 0 ? toY : fromY; //隣のノードのy座標を取得
    let availLink = toX === fromX ? 1 : 2; //x座標が同じなら縦の接続、そうじゃないなら横の接続が可能か
    return links[subY][subX] === 3 || links[subY][subX] === availLink ? true : false; //結果を返す
}

//隣のノードと一つもつながりを持っていないノードを全て取得
Game_Farm.prototype.getUnreachableTile = function(reachedMap) {
    const unreachableTile = [];
    for (let y = 0; y < reachedMap.length; y++) { 
        for(let x = 0; x < reachedMap[0].length; x++) { //reachedMap[y]の各要素がfalseか調べて、
            if(reachedMap[y][x] === false) {unreachableTile.push([x, y])} //falseならその座標を格納する
        }
    }
    return unreachableTile;
}

//隣のノードと一つもつながりを持っていないノードのリンクを修正する
Game_Farm.prototype.modifiedMap = function(links, v) { //vはunreachableTile
    const newLinks = [...links];
    for(let i = 0; i < v.length; i++) {
        newLinks[v[i][1]][v[i][0]] = this.createLink(newLinks, v[i][0], v[i][1]); //リンクの修正
    }
    return newLinks; 
}

function compressLinks(links) { //リンク情報を圧縮
    const n = links[0].length;
    const m = links.length;
    let compressedLinks = `${n}${m}`;//配列の先頭に横幅と縦幅
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            compressedLinks += String(links[i][j]); //それぞれのリンク情報を文字列に変換 文字列だと配列として扱えるので
        }
    }
    return compressedLinks;
}

//マップ生成用の配列を作成する
Game_Farm.prototype.createDungeonFloorMapTileData = function(tile, array) {
    class massData { //マス情報のクラス
        constructor(fromX, fromY, x, y) {
            this.fromX = fromX;
            this.fromY = fromY;
            this.toX = x;
            this.toY = y;
        }
    }

    const n = Number(array[0]); //横幅
    const m = Number(array[1]); //縦幅

    const toX = Math.floor(($gameMap.width() - n) / 2); //移動可能領域の原点のx座標
    const toY = Math.floor(($gameMap.height() - m) / 2); //移動可能領域の原点のy座標

    this._mapOriginX = toX; //移動可能領域の原点のx座標を格納
    this._mapOriginY = toY; //移動可能領域の原点のy座標を格納

    const mapArray = recreateArray(array); //リンク情報を圧縮データから２次元配列データに変換
    const dataArray = mapArray.map((yProp, y) => {
        return yProp.map((xProp, x) => {
            let mass = 0;
            switch(xProp) {
                case 0:
                    mass = tile[0];
                    break;
                case 1:
                    mass = tile[1];
                    break;
                case 2:
                    mass = tile[2];
                    break;
                case 3: //上隣りのマスの左側に壁があるときだけ左上に壁をおく
                    mass = mapArray[y-1][x] === 0 || mapArray[y-1][x] === 1 ? tile[4] : tile[3];
                    break;  
            }
            return new massData(mass, 0, toX + x, toY + y);
        })
    })

    this._tileData = dataArray.flat(); //１次元配列に平坦化
}

function recreateArray(array) { //リンク情報を圧縮データから２次元配列データに変換
    const n = Number(array[0]);
    const m = Number(array[1]);
    const mapArrayStr = new Array(m);
    for (let i = 0; i < m; i++) {
        mapArrayStr[i] = [...array].slice(i * n + 2, (i + 1) * n + 2) //横マス分ずつリンク情報文字列から抽出していく
    }
    let mapArray = mapArrayStr.map((yProp) => {
        return yProp.map((xProp) => {return Number(xProp)}) //str配列なのでint配列に変換する
    })
    return mapArray;
}

// ================
// イベント生成
// ================

//ダンジョン内イベント生成準備
//一つのマスが隣り合ういくつのマスと繋がっているか取得
Game_Farm.prototype.pathInDungeon = function(array) {
    array.map((v, y) => {
        v.map((w, x) => {
            let path = 0;
            //マイナス方向
            if(w === 3) {path += 2}
            else if (w === 1 || w === 2) {path += 1}
            //プラス方向
            if (x > 0) {
                if (array[y][x-1] === 3 || array[y][x-1] === 2) {path++}
            }
            if (y > 0) {
                if (array[y-1][x] === 3 || array[y-1][x] === 1) {path++}
            }
            return path;
        }) 
    })
    return array;
}

// ================================================================
//
// 影描画                             
//         
// ================================================================

Game_Farm.prototype.setScreenCoordinates = function() {
    const tw = $gameMap.tileWidth();
    const th = $gameMap.tileHeight();
    //スクリーン上の座標を設定
    this.originMapScreenX = () => {return (Graphics.boxWidth - this._mapW * tw) / 2}; //移動可能領域の原点の画面上のx座標  + 4
    this.originMapScreenY = () => {return (Graphics.boxHeight - this._mapH * th) / 2}; //移動可能領域の原点の画面上のy座標 + 4

    this.originalSightScreenX = () => {return this.originMapScreenX() + Math.max(this.inMapPlayerX() - this._sight, 0) * tw}; //視界の原点の画面上のx座標
    this.originalSightScreenY = () => {return this.originMapScreenY() + Math.max(this.inMapPlayerY() - this._sight, 0) * th}; //視界の原点の画面上のy座標

    this._mapScreenWidth = this._mapW * tw; //マップの画面上の幅
    this._mapScreenHeight = this._mapH * th; //マップの画面上の高さ

    const mw = $gameMap.width();
    const mh = $gameMap.height();
    const oX = this._mapOriginX;
    const oY = this._mapOriginY;
    const px = this.inMapPlayerX();
    const py = this.inMapPlayerY();
    const sight = this._sight;
    this.inSightOriginScreenX = () => {return ((Graphics.boxWidth - mw * tw) / 2 + (oX + Math.max(px - sight, 0)) * tw)}; // + 4
    this.inSightOriginScreenY = () => {return ((Graphics.boxHeight - mh * th) / 2 + (oY + Math.max(py - sight, 0)) * th)}; // + 4
    this.inSightScreenWidth = () => {return this.sightW() * tw}; //視界の画面上の幅
    this.inSightScreenHeight = () => {return this.sightH() * th}; //視界の画面上の高さ
}

Game_Farm.prototype.updataShadow = function() {
    //プレイヤーの視界
    if (this._dungeonSight === undefined) {this._dungeonSight = 2;}
    if (this._fieldSight === undefined) {this._fieldSight = 3;}
    this.clearShadow();
    this.setCoordinates();
    this.setScreenCoordinates();
    if (this._exploringData._stage > 0) {
        this.updataDungeonSight();
    } else if (this._exploringData._stage === 0) {
        this.updataFieldSight()
    }
}

//影を全除去
Game_Farm.prototype.clearShadow = function() {
    SceneManager._scene.children[SceneManager._scene.children.length - 1].children = [];
}

//影のアップデートinダンジョン
Game_Farm.prototype.updataDungeonSight = function() {
    this.createDungeonMapInSight(this._sight, this._exploringData._floorMap); //影マップ生成
    const opacity = ["1", "0.75", "0.5"];
    this._opacity = opacity;
    this.createDungeonShadowData(this.inSightPlayerX(), this.inSightPlayerY(), this._shadowData._mapArrayInSight); //透過マップを生成

    this.updataVoidShadowData();

    const ox = this.originMapScreenX();
    const oy = this.originMapScreenY();
    const ow = this._mapScreenWidth;
    const oh = this._mapScreenHeight;
    const ix = this.originalSightScreenX();
    const iy = this.originalSightScreenY();
    const array = this._shadowData._shadowMap; //透過マップ

    //移動可能領域外の影を生成
    const voidArray = this._shadowData._voidShadowMap;
    const voidRgba = `rgba(0, 0, 0, ${opacity[0]})`;
    const voidShadowBitmap = this.createVoidShadowBitmap(ox, oy, voidRgba, voidArray)
    const voidShadowSprite = new Sprite(voidShadowBitmap);
    SceneManager._scene.children[SceneManager._scene.children.length - 1].addChild(voidShadowSprite);
    //移動可能領域内視界外の影を生成
    //ox, oy, ow, oh, ix, iy, rgba, array
    const outerRgba = `rgba(0, 0, 0, ${opacity[1]})`;
    const outerShadowBitmap = this.createOuterShadowBitmap(0, 0, Graphics.boxWidth, Graphics.boxHeight, ix, iy, outerRgba, array); //ox, oy, ow, oh, ix, iy, outerRgba, array
    const outerShadowSprite = new Sprite(outerShadowBitmap);
    SceneManager._scene.children[SceneManager._scene.children.length - 1].addChild(outerShadowSprite);

    //視界内の影を生成
    const sightRgba = `rgba(0, 0, 0, ${opacity[2]})`;
    this.updateInSightShadow(ix, iy, sightRgba, array);
}

//影のアップデートinフィールド
Game_Farm.prototype.updataFieldSight = function() {
    const sight = this._sight;
    this.createFieldMapInSight(sight); //影マップ生成
    const opacity = ["1", "0.5", "0.25"];
    this._opacity = opacity;
    this.createFieldShadowData(sight, sight, this._shadowData._mapArrayInSight); //透過マップを生成

    const ox = 0;
    const oy = 0;
    const ow = Graphics.boxWidth;
    const oh = Graphics.boxHeight;
    const ix = (Graphics.boxWidth - (sight * 2 + 1) * $gameMap.tileWidth()) / 2;
    const iy = (Graphics.boxHeight - (sight * 2 + 1) * $gameMap.tileHeight()) / 2;
    const array = this._shadowData._shadowMap; //透過マップ

    //移動可能領域内視界外の影を生成
    //ox, oy, ow, oh, ix, iy, rgba, array
    const outerRgba = `rgba(32, 32, 32, ${opacity[1]})`;
    const outerShadowBitmap = this.createOuterShadowBitmap(ox, oy, ow, oh, ix, iy, outerRgba, array);
    const outerShadowSprite = new Sprite(outerShadowBitmap);
    SceneManager._scene.children[SceneManager._scene.children.length - 1].addChild(outerShadowSprite);

    //視界内の影を生成
    const sightRgba = `rgba(64, 64, 64, ${opacity[2]})`;
    this.updateInSightShadow(ix, iy, sightRgba, array);
}

//移動可能領域外の影を生成
Game_Farm.prototype.createVoidShadowBitmap = function(ox, oy, rgba, array) {
    const bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
    const context = bitmap._context;
    context.beginPath();
    context.moveTo(0,0);
    context.fillStyle = rgba;
    context.fillRect(0, 0, Graphics.boxWidth + 100, Graphics.boxHeight + 100);

    const w = $gameMap.tileWidth();
    const h = $gameMap.tileHeight();
    for (let y = 0; y < array.length; y++) {
        for (let x = 0; x < array[0].length; x++) {
            if (array[y][x] === 1) {
                context.clearRect(ox + x * w, oy + y * h, w, h);
            }
        }
    }
    context.stroke();
    return bitmap;
}

//移動可能領域内不可視領域の影を生成
Game_Farm.prototype.createOuterShadowBitmap = function(ox, oy, ow, oh, ix, iy, rgba, array) {
    const bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
    const context = bitmap._context;
    context.beginPath();
    context.moveTo(0,0);
    context.fillStyle = rgba;
    context.fillRect(ox, oy, ow, oh);

    const w = $gameMap.tileWidth();
    const h = $gameMap.tileHeight();
    for(let y = 0; y < array.length; y++) {
        for(let x = 0; x < array[0].length; x++) {
            if(array[y][x] < Number(this._opacity[1])) {
                context.clearRect(ix + x * w, iy + y * h, w, h);
            }
        }
    }
    context.stroke();
    return bitmap;
}

//視界内の影を生成
Game_Farm.prototype.updateInSightShadow = function(originX, originY, rgba, array) {
    const w = $gameMap.tileWidth();
    const h = $gameMap.tileHeight();
    for (let y = 0; y < array.length; y++) {
        for (let x = 0; x < array[0].length; x++) {
            if (array[y][x] > 0 && array[y][x] < Number(this._opacity[1])) {
                const screenX = originX + x * w;
                const screenY = originY + y * h;
                const shadowBitmap = this.createShadowBitmap(screenX, screenY, w, h, rgba);
                const shadowSprite = new Sprite(shadowBitmap);
                SceneManager._scene.children[SceneManager._scene.children.length - 1].addChild(shadowSprite);
            }
        }
    }
}

Game_Farm.prototype.createShadowBitmap = function(x, y, w, h, rgba) {
    const bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
    const context = bitmap._context;
    context.beginPath();
    context.moveTo(0,0);
    context.fillStyle = rgba; //`rgba(0, 0, 0, ${opacity})`
    context.fillRect(x, y, w, h);
    context.stroke();
    return bitmap;
}

//ダンジョン内
Game_Farm.prototype.createDungeonMapInSight = function(sight, array) {
    //プレイヤーの座標を設定
    const pX = this.inMapPlayerX(); //移動可能領域内でのプレイヤーのx座標
    const pY = this.inMapPlayerY(); //移動可能領域内でのプレイヤーのy座標
    const w = this._mapW;
    const h = this._mapH;
    
    const mapArray = recreateArray(array)
    const mapArrayInSight = [];
    for (let y = 0; y < mapArray.length; y++) {
        if (y >= Math.max(pY - sight, 0) && y <= Math.min(pY + sight, h - 1)) {
            mapArrayInSight.push(mapArray[y].slice(Math.max(pX - sight, 0), Math.min(pX + sight + 1, w)));
        }
    }
    // console.log(mapArrayInSight);
    this._shadowData._mapArrayInSight = mapArrayInSight;
}

Game_Farm.prototype.createDungeonShadowData = function(x, y, array) {
    this.checkDungeonSight(x, y, array);
    const opacity = this._opacity;
    this._shadowData._shadowMap = this._reachedMap.map((v) => {
        return v.map((w) => {
            if (w > 1) {
                return "0"; //経路２本以上あったら視界内
            } else if (w === 1) {
                return opacity[2]; //経路1本だったら半視界内
            } else if (w === 0) {
                return opacity[1]; //経路0本だったら視界外
            }   
        })     
    })
}

Game_Farm.prototype.createExploredMapArray = function(array) {
    this._shadowData._voidShadowMap = recreateArray(array);
}

Game_Farm.prototype.updataVoidShadowData = function() {
    // this._shadowData._voidShadowMap = ;
    for (let y = 0; y < this._shadowData._shadowMap.length; y++) {
        for (let x = 0; x < this._shadowData._shadowMap[0].length; x++) {
            if (Number(this._shadowData._shadowMap[y][x]) < Number(this._opacity[1])) {
                const vx = this.sightOriginX() + x;
                const vy = this.sightOriginY() + y;
                this._shadowData._voidShadowMap[vy][vx] = 1;
            }
        }
    }
}

Game_Farm.prototype.checkDungeonSight = function(x, y, links) {
    //空白のリンクマップを生成
    this._reachedMap = Array.from(links, () => Array(links[0].length).fill(0));
    this._reachedMap[y][x] = 2;
    //チェック開始
    this._tile = [];
    this._newTile = [[x, y]];
    for (let i = 0; i < this._sight + 1; i++) {
        this._tile = [...new Set(this._newTile.map(JSON.stringify))].map(JSON.parse);
        this._newTile = [];
        for (const v of this._tile) {
            this.checkMarginalDungeonSight(v[0], v[1], i, links);
        }
    }
}

Game_Farm.prototype.checkMarginalDungeonSight = function(x, y, distance, links) {
    const pX = this.inSightPlayerX();
    const pY = this.inSightPlayerY();
    const w = this.sightW();
    const h = this.sightH();

    const coAry = [];
    if (x - pX >= 0 && y - pY >= 0) {
        coAry.push([x + 1, y]);
        coAry.push([x, y + 1]);
    }
    if (x - pX >= 0 && y - pY <= 0) {
        coAry.push([x + 1, y]);
        coAry.push([x, y - 1]);
    }
    if (x - pX <= 0 && y - pY >= 0) {
        coAry.push([x - 1, y]);
        coAry.push([x, y + 1]);
    }
    if (x - pX <= 0 && y - pY <= 0) {
        coAry.push([x - 1, y]);
        coAry.push([x, y - 1]);
    }
    for (let i = 0; i < coAry.length; i++) {
        const nX = coAry[i][0];
        const nY = coAry[i][1];
        if (nX >= 0 && nX < w && nY >= 0 && nY < h) {//隣が存在しているか
            if (this.isConnected(x, y, nX, nY, links) && distance < this._sight) {//隣あるいは現在のノードの条件
                //this.checkMarginalDungeonSight(nX, nY, distance + 1, links);
                this._reachedMap[nY][nX]++;
                this._newTile.push([nX, nY]);
            }
        }
    }
}

//フィールド上
Game_Farm.prototype.createFieldMapInSight = function(sight) {
    const sw = sight * 2 + 1;
    const mapArray = Array.from({length:sw}, () => Array(sw));
    for (let y = 0; y < sw; y++) {
        for (let x = 0; x < sw; x++) {
            const targetX = $gamePlayer.x + x - sight;
            const targetY = $gamePlayer.y + y - sight;
            const terrainTag = $gameMap.terrainTag(targetX, targetY)
            // const link = terrainTag === 3 || terrainTag === 4 ? 0 : 3;
            mapArray[y][x] = terrainTag; //$gameMap.layeredTiles($gamePlayer.x + x, $gamePlayer.y + y);
        }
    }
    this._shadowData._mapArrayInSight = mapArray;
}

Game_Farm.prototype.createFieldShadowData = function(x, y, array) {
    this.checkFieldSight(x, y, array);
    console.log(this._reachedMap);
    const opacity = this._opacity;
    this._shadowData._shadowMap = this._reachedMap.map((v) => {
        return v.map((w) => {
            if (w > 1) {
                return "0"; //経路２本以上あったら視界内
            } else if (w === 1) {
                return opacity[2]; //経路1本だったら半視界内
            } else if (w === 0) {
                return opacity[1]; //経路0本だったら視界外
            }   
        })     
    })
    console.log(this._shadowData._shadowMap);
}

Game_Farm.prototype.checkFieldSight = function(x, y, links) {
    //空白のリンクマップを生成
    this._reachedMap = Array.from(links, () => Array(links[0].length).fill(0));
    this._reachedMap[y][x] = this._sight;
    //チェック開始
    this._tile = [];
    this._newTile = [[x, y, this._sight + 1]];
    for (let i = 0; i < this._sight; i++) {
        this._tile = [...new Set(this._newTile.map(JSON.stringify))].map(JSON.parse);
        this._newTile = [];
        for (const v of this._tile) {
            this.checkMarginalFieldSight(v[0], v[1], v[2]);
        }
    }
}

Game_Farm.prototype.checkMarginalFieldSight = function(x, y, sightLv) {
    const pX = this.inSightPlayerX();
    const pY = this.inSightPlayerY();

    const coAry = [];
    if (x - pX >= 0 && y - pY >= 0) {
        coAry.push([x + 1, y]);
        coAry.push([x, y + 1]);
    }
    if (x - pX >= 0 && y - pY <= 0) {
        coAry.push([x + 1, y]);
        coAry.push([x, y - 1]);
    }
    if (x - pX <= 0 && y - pY >= 0) {
        coAry.push([x - 1, y]);
        coAry.push([x, y + 1]);
    }
    if (x - pX <= 0 && y - pY <= 0) {
        coAry.push([x - 1, y]);
        coAry.push([x, y - 1]);
    }
    for (let i = 0; i < coAry.length; i++) {
        const nX = coAry[i][0];
        const nY = coAry[i][1];
        const thisSight = sightLv;
        const nextSightLv = this.isSightBlocked(nX, nY) ? Math.max(thisSight - this.forestSightBlock(thisSight), 0) : Math.max(thisSight - 1, 0); //thisSight - Math.max(thisSight - 1, 1)
        if(nextSightLv > 0) {
            this._reachedMap[nY][nX] = Math.max(nextSightLv, this._reachedMap[nY][nX]);
            this._newTile.push([nX, nY, nextSightLv]);
        }
    }
}

Game_Farm.prototype.isSightBlocked = function(x, y) {
    const terrainTag = this._shadowData._mapArrayInSight[y][x];
    if (terrainTag === 2 || terrainTag === 3) {return true}
}

Game_Farm.prototype.forestSightBlock = function(thisSight) {
    return this._forestSight ? 1 : Math.max(thisSight - 1, 1);
}

//-----------------------------------------------------------------------------
// Spriteset_ShadowLayer
//
// 影用のSpriteを追加
const Scene_Map_prototype_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
    Scene_Map_prototype_createDisplayObjects.apply(this, arguments)
    this.createShadowLayer();
};

Scene_Map.prototype.createShadowLayer = function() {
    this._spriteset = new Spriteset_ShadowLayer();
    this.addChild(this._spriteset);
    this._spriteset.update();
};

//-----------------------------------------------------------------------------
// Spriteset_ShadowLayer
//
// The set of sprites on the map screen.

function Spriteset_ShadowLayer() {
    this.initialize(...arguments);
}

Spriteset_ShadowLayer.prototype = Object.create(Spriteset_Base.prototype);
Spriteset_ShadowLayer.prototype.constructor = Spriteset_ShadowLayer;

Spriteset_ShadowLayer.prototype.initialize = function() {
    Spriteset_Base.prototype.initialize.call(this);
    this.children = [];
};

})()

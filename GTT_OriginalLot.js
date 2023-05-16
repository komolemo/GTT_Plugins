//=============================================================================
// RPG Maker MZ - GTT_OriginalLot
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 
 * @author 
 *
 * @help GTT_OriginalLot.js
 *
 * This plugin changes the layout of the menu screen.
 * It puts the commands on the top and the status on the bottom.
 *
 * It does not provide plugin commands.
 */

/*:ja
 * @target MZ
 * @plugindesc メニュー画面のレイアウトを変更します。
 * @author 
 *
 * @help GTT_OriginalLot.js
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

(() => {

const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
const params = PluginManager.parameters(pluginName);
const parameterResorceTileArray = JSON.parse(params.resorceTileListsGTT);
const parameterRegionArray = JSON.parse(params.regionZcoListGTT);
   
//managerへのFarmの追加
    
window.$gameFarm = {};
$gameFarm = null;

const _createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _createGameObjects.call(this);
    $gameFarm = new Game_Farm();
};

const _makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    const contents = _makeSaveContents.call(this);
    contents.gameFarm = $gameFarm;
    return contents;
  };

const _extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _extractSaveContents.call(this, contents);
    $gameFarm = contents.Farm;
  };

//objectでのFarmの追加

function Game_Farm() {
    this.initialize(...arguments);
}

Game_Farm.prototype.initialize = function() {
    this.clear();
};

Game_Farm.prototype.clear = function() {
    this._data = [];
};

Game_Farm.prototype.array = function() {
    return this._data || 0;
};

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
		};
    return this._data || 0;
};

//資源タイルリストのn番目の資源タイルリスト(オブジェクト)を取得
Game_Farm.prototype.resorceTileList = function(param) {
    const paramKeyBase = JSON.parse(parameterResorceTileArray[param - 1]);
    const paramTileArray = paramKeyBase["tileArrayGTT"]

    return paramTileArray;
};

//あるタイルIDが属している資源タイルID群(タイルタイプ)を取得
Game_Farm.prototype.tileTypeGTT = function(param) {
    let tileTypeGtt = 0;
   for (let loopTileType = 1, foundTileType = false; loopTileType <= parameterResorceTileArray.length && foundTileType === false; loopTileType++){
        tileTypeGtt = loopTileType;
        foundTileType = this.resorceTileList(tileTypeGtt).includes(param);
    }
    if (this.resorceTileList(tileTypeGtt).includes(param) === true) {
        return tileTypeGtt;
    } else {return -1};
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
    };
};

//資源タイルID群n番目の資源リストm番目を採取くじ配列に追加する処理
Game_Farm.prototype.addLotArray = function(param1, param2) {
    const paramKeyBase = JSON.parse(parameterResorceTileArray[param1 - 1]);
    const paramResorceLotObj = JSON.parse(paramKeyBase["resorceListsGTT"]);

    const resorceKeyBase = JSON.parse(paramResorceLotObj[param2 - 1]);
    const paramResorceId = Number(resorceKeyBase["resorceGTT"]);
    const paramResorceLotNum = Number(resorceKeyBase["lotNumGTT"]);

    this.addLot(paramResorceId, paramResorceLotNum);
};

//採取くじ配列に資源くじを追加する処理(param1:アイテムID, param2:くじの本数)
Game_Farm.prototype.addLot = function(param1, param2) {
    for (let loopAddLot = 1; loopAddLot <= param2; loopAddLot++) {
        this.array().push(param1)
    };
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
    };

    console.log( this.zcoRegionZco(setZco) )
    if ( this.ArrayRegionZco(setZco).includes(regionId) ) { return this.zcoRegionZco(setZco) } else { return - 1 };
};

//Z座標リストの一つにに対応するリージョン配列を取得
Game_Farm.prototype.ArrayRegionZco = function(param) {
    const paramKeyBase = JSON.parse(parameterRegionArray[param - 1]);
    const paramRegionArray = paramKeyBase["regionArrayGTT"];

    console.log(paramRegionArray)
    return paramRegionArray;
};

//Z座標リストの一つに対応するz座標を取得
Game_Farm.prototype.zcoRegionZco = function(param) {
    const paramKeyBase = JSON.parse(parameterRegionArray[param - 1]);
    const paramRegionArray = paramKeyBase["regionZcoGTT"];
    return paramRegionArray;
};

})();

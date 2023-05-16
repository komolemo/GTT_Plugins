//=============================================================================
// RPG Maker MZ - GTT_Modification
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 
 * @author 
 *
 * @help AltMenuScreen.js
 *
 * This plugin changes the layout of the menu screen.
 * It puts the commands on the top and the status on the bottom.
 *
 * It does not provide plugin commands.
 */

/*:ja
 * @target MZ
 * @plugindesc 廃墟ハウスを作成/保存するプラグイン
 * @author 
 *
 * @help GTT_Modification.js
 *
 * @param WorldLists
 * @text ワールドの追加
 * @desc 探索ハウスを配置するワールドを追加する
 * @type struct<WORLDLIST>[]
 * 
 */

/*~struct~WORLDLIST:ja
@param WORLDNAME
@text ワールド名を入力
@type string
@desc 追加するワールド名を入力
@param FARMPOINTLIST
@text 探索ハウスの配列
@type struct<aaa>[]
@desc 何も入力しない
*/

(function(){
    'use strict';

const pluginName = "GTT_Modification";
const parameters = PluginManager.parameters(pluginName);
const WORLDNAME_LIST = JSON.parse(parameters['WorldLists']) || 0;

//managerへのRuinHouseの追加
    
window.$gameRuinHouse = {};
$gameRuinHouse = null;

const _createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _createGameObjects.call(this);
    $gameRuinHouse = new Game_RuinHouse();
};

const _makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    const contents = _makeSaveContents.call(this);
    contents.gameRuinHouse = $gameRuinHouse;
    return contents;
  };

const _extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _extractSaveContents.call(this, contents);
    $gameRuinHouse = contents.RuinHouse;
  };


//objectでのRuinHouseの追加

function Game_RuinHouse() {
    this.initialize(...arguments);
}

Game_RuinHouse.prototype.initialize = function() {
    this.clear();
};

Game_RuinHouse.prototype.clear = function() {
    this._data = [];
};

//ワールド配列取得
Game_RuinHouse.prototype.list = function() {
    return this._data || 0;
};

//ワールド配列の長さ取得
Game_RuinHouse.prototype.length = function() {
    return this._data.length || 0;
};

//ワールドオブジェクト取得
Game_RuinHouse.prototype.object = function(ruinId) {
    return this._data[ruinId] || 0;
};

Game_Variables.prototype.setObject = function(objectIndex, value) {
    if (objectIndex > 0 && objectIndex < $gameRuinHouse.length) {
        this._data[objectIndex] = value;
        this.onChange();
    }
};

Game_RuinHouse.prototype.pushArray = function(value) {
    this._data.push(value);
    this.onChange();
};

Game_RuinHouse.prototype.onChange = function() {
    $gameMap.requestRefresh();
};

})();

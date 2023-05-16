//=============================================================================
// RPG Maker MZ - GTT_VariousArray
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 
 * @author 
 *
 * @help GTT_VariousArray.js
 *
 * This plugin changes the layout of the menu screen.
 * It puts the commands on the top and the status on the bottom.
 *
 * It does not provide plugin commands.
 */

/*:ja
 * @target MZ
 * @plugindesc フィールドバトルシステム関連の処理
 * @author 
 *
 * @help GTT_VariousArray.js
 *
 * 
 * @param spItemArrayListsGTT
 * @text　アイテム配列リスト
 * @desc ある場面で特殊処理を行うアイテムの配列
 * @type struct<SpItemArrayLists>[]
 * 
 * 
 */

/*~struct~SpItemArrayLists:ja
 @param spItemArrayGTT
 @text アイテム配列
 @type string
 @desc 特殊処理を行うアイテムの配列
 @
 @param memo
 @text メモ
 @type string
 @desc 
 @
 */



(() => {

const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
const params = PluginManager.parameters(pluginName);
const arrayList = JSON.parse(params.spItemArrayListsGTT);

//オリジナルステータスクラスを作る

//アクター

const actObj = {
    phy:0,
    dxt:0,

    swordSkl:0,
    spearSkl:0,
    hammerSkl:0,
    axeSkl:0,
    knuckleSkl:0,
    throwSkl:0,

    magicSkl:0,
    priestSkl:0,
    conjurerSkl:0,
    magitecSkl:0,

    weapon1:0,
    weapon2:0,

    guard:0
}



})();

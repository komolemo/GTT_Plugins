//=============================================================================
// RPG Maker MZ - GTT_BattleSystem
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
 * @plugindesc SRPG的なバトルシステムを実装する
 * @author 
 *
 * @help GTT_BattleSystem.js
 *
 * @param mapMinX
 * @text X座標の最低値
 * @desc バトルマップ移動可能領域のX座標の最低値
 * @type number
 * @default 0
 * 
 * @param mapMaxX
 * @text X座標の最大値
 * @desc バトルマップ移動可能領域のX座標の最大値
 * @type number
 * @default 0
 * 
 * @param mapMinY
 * @text Y座標の最低値
 * @desc バトルマップ移動可能領域のY座標の最低値
 * @type number
 * @default 0
 * 
 * @param mapMaxY
 * @text Y座標の最大値
 * @desc バトルマップ移動可能領域のY座標の最大値
 * @type number
 * @default 0
 * 
 * @param enemyWeaponId
 * @text 敵が装備している武器
 * @desc 
 * @type weapon
 * @default 0
 * 
 * @param statusVariableId
 * @text 変数ID
 * @desc オリジナル能力値を格納しているツクール変数のID
 * @type variable
 * @default 0
 * 
 * @param turnProgressSwitch
 * @text スイッチID
 * @desc このスイッチがONの間、ターン進行イベントが継続
 * @type switch
 * @default 0
 * 
 * @param abilitySkillTypeId
 * @text スキルタイプ
 * @desc このスキルタイプはアビリティ
 * @type number
 * @default 0
 * 
 * @param ultimateSkillTypeId
 * @text スキルタイプ
 * @desc このスキルタイプはアルティメット
 * @type number
 * @default 0
 * 
 * @param coolTimeCorrectionValue
 * @text クールタイムへの倍率
 * @desc 設定したクールタイムへ定数をかけて、戦闘時間を調整する
 * @type number
 * @default 0
 */

(function(){
    'use strict';

const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
const parameters = PluginManager.parameters(pluginName);

const MIN_X = Number(parameters['mapMinX'] || 0);
const MAX_X = Number(parameters['mapMaxX'] || 0);
const MIN_Y = Number(parameters['mapMinY'] || 0);
const MAX_Y = Number(parameters['mapMaxY'] || 0);

const ENEMY_WEAPON = Number(parameters['enemyWeaponId'] || 0);
const STATUS_VARIABLE = Number(parameters['statusVariableId'] || 0);
const TURNPROGRESS_SWITCH = Number(parameters['turnProgressSwitch'] || 0);

const ABILITY_SKILLTYPE = Number(parameters['abilitySkillTypeId'] || 0);
const ULTIMATE_SKILLTYPE = Number(parameters['ultimateSkillTypeId'] || 0);

const COOLTIME_CORRECTIONVALUE = Number(parameters['coolTimeCorrectionValue'] || 0);

//managerへのBattleSystemsの追加
    
window.$gameBattleSystems = {};
$gameBattleSystems = null;

const _createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _createGameObjects.call(this);
    $gameBattleSystems = new Game_BattleSystems();
};

const _makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    const contents = _makeSaveContents.call(this);
    contents.gameBattleSystems = $gameBattleSystems;
    return contents;
  };

const _extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _extractSaveContents.call(this, contents);
    $gameBattleSystems = contents.BattleSystems;
  };

//objectでのBattleSystemsの追加

function Game_BattleSystems() {
    this.initialize(...arguments);
};

Game_BattleSystems.prototype.initialize = function() {
    this.clear();
};

Game_BattleSystems.prototype.clear = function() {
    this.attackData = [];
    this.debug = {};
    this.battlerArray = [];
};

////■■■■■■■■■■■////
////エンカウント////
////■■■■■■■■■■■////

//プレイヤーがエンカウントした位置の情報
Game_BattleSystems.prototype.encountRegion = function(x, y) {
    const obj = {
        region:$gameMap.regionId(x, y),
        mapEncountList:$dataMap.encounterList
    }
    return obj;
};

//敵グループ決定
Game_BattleSystems.prototype.encountTroop = function(x, y) {
    const region = this.encountRegion(x, y).region
    const mapEncountList = this.encountRegion(x, y).mapEncountList

    const encountList = [];
    for ( let i = 1 ; i <= mapEncountList.length ; i++) {
        if ( mapEncountList[i-1].regionSet.includes(region) ) {
         encountList.push(mapEncountList[i-1].troopId);
        };
       };

    const encountTroopGropeId = encountList[Math.floor(Math.random() * encountList.length)];
    const encountEnemyNum = $dataTroops[encountTroopGropeId].members.length;
    const battlerArray = new Array(encountEnemyNum + 1);

    this.battlerArray = battlerArray;
    this.encountTroopGropeId = encountTroopGropeId;
    this.encountEnemyNum = encountEnemyNum;
    this.enemyNum = encountEnemyNum;
};

//敵スポーン位置を決定
Game_BattleSystems.prototype.enemySpawn = function(enemyNum) {
    const centerX = ((MIN_X + MAX_X) / 2);
    const centerY = ((MIN_Y + MAX_Y) / 2);
    const signX = Math.sign($gamePlayer.x - centerX);
    const signY = Math.sign($gamePlayer.y - centerY);

    const enemyPositionAry = [];
    for (let i = 1; i <= enemyNum; i++) {

        for ( let loop = false ; loop != true ;) {
            const xEnmMod = Math.floor(Math.random() * ((centerX - 1) / 2 + 1));
            const yEnmMod = Math.floor(Math.random() * ((centerY - 1) / 2 + 1));
            
            let xEnSnMod = 0;
            let yEnSnMod = 0;

            signX < 0 ? xEnSnMod = 1 : xEnSnMod = -1; 
            signY < 0 ? yEnSnMod = 1 : yEnSnMod = -1;
        
            const enemySetX = centerX + xEnmMod * xEnSnMod;
            const enemySetY = centerY + yEnmMod * yEnSnMod;

            let anythingExist = false
            for (let i = 1;i <= enemyPositionAry.length; i++) {
                if (enemySetX === enemyPositionAry[i-1].x && enemySetY === enemyPositionAry[i-1].y) {anythingExist = true}
            };
        
            if ($gamePlayer.x != enemySetX && $gamePlayer.y != enemySetY &&
               anythingExist != true) {
                const obj = {x:enemySetX, y:enemySetY}
                enemyPositionAry.push(obj);
                loop = true
            };
        };
    };

    this.enemyPositionAry = enemyPositionAry;

};

Game_BattleSystems.prototype.enemyPositionAry = function () {
    return this.enemyPositionAry;
};

//能力値オブジェクト配列生成
Game_BattleSystems.prototype.makeStatusObj = function(troopId) {
    this.makeEnemyObj(troopId);
    this.makePlayerObj();
    this.makeCoolTimeObj();
    this.decideActGaugeMax();
};

//敵能力値オブジェクト生成
Game_BattleSystems.prototype.makeEnemyObj = function(troopId) {
    for (let i = 1; i <= $dataTroops[troopId].members.length; i++) {
        const respawnId = i;
        const enemyId = $dataTroops[troopId].members[i-1].enemyId;
        const enemyData = $dataEnemies[enemyId];
    
        const status = function () {
            const getStatus = {
                "mhp":$dataEnemies[enemyId].params[0],
                "mmp":$dataEnemies[enemyId].params[1],
                "atk":$dataEnemies[enemyId].params[2],
                "def":$dataEnemies[enemyId].params[3],
                "mat":$dataEnemies[enemyId].params[4],
                "mdf":$dataEnemies[enemyId].params[5],
                "agi":$dataEnemies[enemyId].params[6],
                "luk":$dataEnemies[enemyId].params[7],
                "dex":JSON.parse($dataEnemies[enemyId].meta.addBaseStatus)[0]
            }
            return getStatus
        };

        const p = enemyData.meta.weaponProficiency
        const weaponProficiency = {
            //物理
             martialArts:p,
             sword:p,
             spear:p,
             axes:p,
             hammer:p,
             throwing:p,
            //魔法
             rod:p,
             scripture:p,
             flute:p,
             mageGun:p
        };

        const enemyInfo = {
         eventId:respawnId,
         enemyDataId:enemyId,
         hp:$dataEnemies[enemyId].params[0],
         mp:$dataEnemies[enemyId].params[1],
         status:status,
         addStatus:{},
         spStatus:{},
         selectedWeaponId:ENEMY_WEAPON,
         weaponProficiency:weaponProficiency,
         equip:function() {return [$dataWeapons[this.selectedWeaponId]]},
         skill:function() {return $gameBattleSystems.skillsArray(this.eventId)},
         state:[null],
         actQ:0,
         actGauge:0,
         normalAttackTargetId:[{eventId:0}],
        };

        status().hp = enemyInfo.hp;
        status().mp = enemyInfo.mp;

        this.battlerArray[i] = enemyInfo;
    
        //this.battlerArray[battlerIndex].addStatus.atkRate
        //
    
        const grossStatus = function() {
            const battlerData = $gameBattleSystems.battlerArray[respawnId];
            const getGrossStatus = {
                "hp":battlerData.hp,
                "mp":battlerData.mp,
                "mhp":battlerData.status().mhp * (battlerData.addStatus.mhpRate + 100),
                "mmp":battlerData.status().mmp * (battlerData.addStatus.mmpRate + 100),
                "atk":battlerData.status().atk * (battlerData.addStatus.atkRate + 100),
                "def":battlerData.status().def * (battlerData.addStatus.defRate + 100),
                "mat":battlerData.status().mat * (battlerData.addStatus.matRate + 100),
                "mdf":battlerData.status().mdf * (battlerData.addStatus.mdfRate + 100),
                "agi":battlerData.status().agi * (battlerData.addStatus.agiRate + 100),
                "luk":battlerData.status().luk,
                "dex":battlerData.status().dex,
            };
            return getGrossStatus;
        };
        
        this.battlerArray[i].grossStatus = grossStatus();
    };
};

//プレイヤーオブジェクト生成
Game_BattleSystems.prototype.makePlayerObj = function () {

    const status = function() {
        const getStatus = {
            "mhp":$gameActors.actor(1).param(0),
            "mmp":$gameActors.actor(1).param(1),
            "atk":$gameActors.actor(1).param(2),
            "def":$gameActors.actor(1).param(3),
            "mat":$gameActors.actor(1).param(4),
            "mdf":$gameActors.actor(1).param(5),
            "agi":$gameActors.actor(1).param(6),
            "luk":$gameActors.actor(1).param(7),
            "dex":$gameVariables.value(STATUS_VARIABLE).dex
        };
        return getStatus;
    };

    const originalStatus = $gameVariables.value(STATUS_VARIABLE);
    const weaponProficiency = originalStatus.weaponProficiency;
    
    const playerObj = {
        eventId:0,
        status:status,
        addStatus:{},
        spStatus:{},
        hp:$gameActors.actor(1).hp,
        mp:$gameActors.actor(1).mp,
        weaponProficiency:weaponProficiency,
        equip:function() {return $gameParty.members()[0].equips()},
        skill:function() {return $gameBattleSystems.skillsArray(0)},
        selectedWeaponId:0,
        state:[null],
        
        actQ:0,
        actGauge:0
    };

    status().hp = playerObj.hp;
    status().mp = playerObj.mp;

    this.battlerArray[0] = playerObj;

    //this.battlerArray[battlerIndex].addStatus.atkRate
    //

    const grossStatus = function() {
        const battlerData = $gameBattleSystems.battlerArray[0];
        const getGrossStatus = {
            "hp":battlerData.hp,
            "mp":battlerData.mp,
            "mhp":battlerData.status().mhp * (battlerData.addStatus.mhpRate + 100),
            "mmp":battlerData.status().mmp * (battlerData.addStatus.mmpRate + 100),
            "atk":battlerData.status().atk * (battlerData.addStatus.atkRate + 100),
            "def":battlerData.status().def * (battlerData.addStatus.defRate + 100),
            "mat":battlerData.status().mat * (battlerData.addStatus.matRate + 100),
            "mdf":battlerData.status().mdf * (battlerData.addStatus.mdfRate + 100),
            "agi":battlerData.status().agi * (battlerData.addStatus.agiRate + 100),
            "luk":battlerData.status().luk,
            "dex":battlerData.status().dex,
        };
        return getGrossStatus;
    };

    this.battlerArray[0].grossStatus = grossStatus;

};

//CTオブジェクト生成
Game_BattleSystems.prototype.makeCoolTimeObj = function () {
    for (let i = 1 ; i <= this.battlerArray.length ; i++) {
        const battlerIndex = i-1;
        const skillsAry = this.skillsArray(battlerIndex);
        const skillNum = skillsAry.length;
        this.battlerArray[i-1].coolTimeObj = new Array(skillNum);

        for (let j = 1 ; j <= skillsAry.length - 1 ; j++) {
            const skillIndex = j;
            this.battlerArray[battlerIndex].coolTimeObj[skillIndex] = {};

            if (skillsAry[skillIndex].stypeId === ULTIMATE_SKILLTYPE) {                
                this.battlerArray[battlerIndex].coolTimeObj[skillIndex].coolTime = 0;
                this.battlerArray[battlerIndex].coolTimeObj[skillIndex].coolTimeMax = skillsAry[skillIndex].tpCost * COOLTIME_CORRECTIONVALUE;        
            } else {
                this.battlerArray[battlerIndex].coolTimeObj[skillIndex] = null;
            };
        };

    };
};

//行動ゲージの長さ決定
Game_BattleSystems.prototype.decideActGaugeMax = function () {
    const battlerArray = this.battlerArray;
    const agiArray = [];
    for (let i = 1; i <= battlerArray.length; i++) {
        const agi = eval(this.battlerArray[i-1].status().agi);
        agiArray.push(agi);
    };
    
    const aryMax = function (a, b) {return Math.max(a, b);}
    let max = agiArray.reduce(aryMax);
    
    this.actGaugeMax = Math.floor(max * 5 / 10) * 10;
};

//ウルトボタン生成関連


////■■■■■■■■■////
////ターン進行////
////■■■■■■■■■////

//ターンごとのatkData配列初期化
Game_BattleSystems.prototype.atkDataClear = function () {
    this.attackData = [];
}

//行動ゲージ更新
Game_BattleSystems.prototype.addActGauge = function () {
    const length = this.battlerArray.length
    const ary = this.battlerArray;
    for (let i = 1 ; i <= length ; i++) {
     if (ary[i-1] != "dead") {
      const agi = ary[i-1].status().agi;
      this.battlerArray[i-1].actGauge += agi;
     };
    };
};

//CT経過
Game_BattleSystems.prototype.coolTimeLapse_ALL = function () {
    const battlerAry = this.battlerArray;
    for (let i = 1 ; i <= battlerAry.length ; i++) {
        const battlerIndex = i - 1;
        this.coolTimeLapse(battlerIndex);
    };
};

Game_BattleSystems.prototype.coolTimeLapse = function (battlerIndex) {
    const skillsAry = this.skillsArray(battlerIndex);
    for (let i = 1 ; i <= skillsAry.length - 1 ; i++) {
        if (skillsAry[i] != null) {
            const nowCoolTime = this.battlerArray[battlerIndex].coolTimeObj[i].coolTime;
            const coolTimeMax = this.battlerArray[battlerIndex].coolTimeObj[i].coolTimeMax;
            this.battlerArray[battlerIndex].coolTimeObj[i].coolTime = Math.min(nowCoolTime + 1, coolTimeMax);            
        };
    };
};

//移動か通常攻撃か
Game_BattleSystems.prototype.moveOrAtk = function(eventId, skillId) {
    const battlerData = this.battlerArray[eventId];

    let skillMeta = 0;
    skillId != 1 ? 
        skillMeta = $dataSkills[skillId].meta :
        skillMeta = $dataWeapons[battlerData.selectedWeaponId].meta;

    const targetId = battlerData.normalAttackTargetId[0].eventId;
    const targetEnemyX = this.getXorY(targetId)._x;
    const targetEnemyY = this.getXorY(targetId)._y;

    const actorX = this.getXorY(eventId)._x;
    const actorY = this.getXorY(eventId)._y;

    const xDistance = Math.abs(actorX - targetEnemyX);
    const yDistance = Math.abs(actorY - targetEnemyY);
    const Distance = Math.max(xDistance, yDistance);
    
    const range = JSON.parse(skillMeta.skillRange)[1];
    
    let act = 0
    Distance <= range ? act =  "attack" : act = "move";

    this.towardChara = targetId;
    return act;
};

//イベントの座標を取得
Game_BattleSystems.prototype.getXorY = function(eventId) {
    if (eventId <= 0) {
        return $gamePlayer;
    } else if (eventId > 0) {
        return $gameMap.event(eventId);
    }; 
};

//プレイヤーの向きを決める
Game_BattleSystems.prototype.decideDirection = function(eventId) {
    const targetEnemyX = this.getXorY(eventId)._x;
    const targetEnemyY = this.getXorY(eventId)._y;
    //y座標
    if ($gamePlayer.y - targetEnemyY > 0) {
        return 3;
    } else if ($gamePlayer.x - targetEnemyX > 0) {
        return 1;
    } else if ($gamePlayer.x - targetEnemyX < 0) {
        return 2;
    } else if (1 === 1) {
        return 0;
    }
};

//攻撃時にatkDataを生成
//targetIdは攻撃タイプがtargetの時のみ関数に影響する
Game_BattleSystems.prototype.makeAtkData = function (eventId) {
    const atkData = {
        skillUserId:this.battlerArray[eventId].eventId,
        rockOnTargetId:this.battlerArray[eventId].normalAttackTargetId[0],
    };
    return atkData;
};

//skillId:skillId,

//スキル配列を取得
Game_BattleSystems.prototype.skillsArray = function (battlerIndex) {
    const eventId = this.battlerArray[battlerIndex].eventId;
    let skillsAry = [null];

    if (eventId != 0) {
        const enemyDataId = this.battlerArray[eventId].enemyDataId;      
        const length = $dataEnemies[enemyDataId].actions.length;

        for (let i = 1; i <= length; i++) {
         const obj = $dataSkills[$dataEnemies[enemyDataId].actions[i-1].skillId];
         skillsAry.push(obj) 
        } ;

    } else if (eventId === 0) {
        skillsAry = skillsAry.concat($gameParty.members()[0].skills()); 
    };
 
    return skillsAry;
};

//通常攻撃かアビリティか

//atkDataIndexからbattlerIndexを取得
Game_BattleSystems.prototype.getBattlerIndex = function(atkDataIndex) {
    return this.attackData[atkDataIndex].skillUserId;
};

//アビリティを取得して格納
Game_BattleSystems.prototype.aquiredAbilityId = function (battlerIndex) {
    const skillsAry = this.skillsArray(battlerIndex);

    const tempAry = new Array(0);
    let abilitySkill = 1;
    let isAquiredAbility = false;
    for (let i = 1, stypeId = 0; i <= skillsAry.length - 1; i++) {
        console.log("431")
        stypeId = skillsAry[i].stypeId;
        if (stypeId === ABILITY_SKILLTYPE) {
            //アビリティIDを格納
            tempAry.push(skillsAry[i].id);
            //アビリティを取得していることを保存
            isAquiredAbility = true;
        };
    };

    //アビリティが複数の場合、ランダムでその一つになる
    console.log("580")
    console.log(tempAry)
    if (isAquiredAbility) {
        abilitySkill = tempAry[Math.floor(Math.random() * tempAry.length)];
    };

    console.log({id:abilitySkill, isAquiredAbility:isAquiredAbility})
    return {id:abilitySkill, isAquiredAbility:isAquiredAbility};
};

Game_BattleSystems.prototype.decideAtkSkill = function (battlerIndex) {
    //通常攻撃時のスキルデータ、スキルor武器メタデータを格納
    let skillId = 1; //this.getNormalAttackSkill(battlerIndex);
    let skillData = $dataSkills[1];
    let skillMeta = $dataWeapons[this.battlerArray[battlerIndex].selectedWeaponId].meta;

    //戦技値と武器熟練度を取得
    const userStatus = this.battlerArray[battlerIndex].status();
    const proficiency = this.weaponProficiency(battlerIndex, this.aquiredAbilityId(battlerIndex).id);

    //目標値と乱数を生成
    let goal = 0;
    if (this.aquiredAbilityId(battlerIndex).isAquiredAbility === true) {
        goal = (userStatus.dex + proficiency) / 2;
    };
    const random = Math.floor(Math.random() * 100 + 1);
    
    //判定成功時のスキルデータ、スキルor武器メタデータを格納
    if (goal >= random) {
        skillId = this.aquiredAbilityId(battlerIndex).id;
        skillData = $dataSkills[skillId];
        skillMeta = $dataSkills[skillId].meta;
    };

    return {id:skillId, skillData:skillData, skillMeta:skillMeta};
};

Game_BattleSystems.prototype.getNormalAttackSkill = function(battlerIndex) {
    const weaponData = $dataWeapons[this.battlerArray[battlerIndex].selectedWeaponId];
    let skillId = 1;
    console.log("620")
    console.log(this.battlerArray[battlerIndex].selectedWeaponId)
    if (this.battlerArray[battlerIndex].selectedWeaponId != undefined) {
        for (let i = 1 ; i <= weaponData.traits.length ; i++) {
            if (weaponData.traits[i-1].code === 35) {
                skillId = weaponData.traits[i-1].dataId;
            };
        };
    };
    return skillId;
};

//範囲表示

//スキル発動

//攻撃対象収集＋スキルアニメーション再生用イベントの設置座標を配列に格納
Game_BattleSystems.prototype.makeArrayAboutTarget = function() {
    const index = this.atkDataIndex;
    const userEventId = this.attackData[index].skillUserId;
    const skillData = this.attackData[index].skillData;
    const skillMeta = this.attackData[index].skillMeta;

    this.attackData[index].skillTargetId = this.sklTargetAry(userEventId, skillMeta);
    this.targetNum = this.sklTargetAry(userEventId, skillMeta).length - 1;
    this.attackData[index].animeTarget = this.sklAnimeTarget(userEventId, skillMeta);   
    this.loopMax = skillData.repeats * this.attackData[index].skillTargetId.length - 1;
};

//アニメーション再生用イベントの設置座標を配列に収める
Game_BattleSystems.prototype.sklAnimeTarget = function (userEventId, skillMeta) {
    const animeTarget = [null];

    const atkType = JSON.parse(skillMeta.skillRange)[0];
    if (atkType === "direction") {
        if (userEventId === 0) {userEventId = - 1};
        const charaDirect = this.getXorY(userEventId).direction() / 2;

        const range = JSON.parse(skillMeta.skillRange)[1];
        const coModArray = [0, -1, 1, 0];
        
        const skillAnimetionX = $gamePlayer.x + coModArray[(charaDirect - 1) % 4] * (range / 2 + 1);
        const skillAnimetionY = $gamePlayer.y + coModArray[(charaDirect + 1) % 4] * (range / 2 + 1);
        
        const obj = {
         x:Math.max(Math.min(skillAnimetionX, 14), 4),
         y:Math.max(Math.min(skillAnimetionY, $gameMap.height() - 1), 0)
        };
        
        animeTarget.push(obj);
    }

    else if (atkType === "scope") {
        const range = JSON.parse(skillMeta.skillRange)[1];      
        const targetArray = [];
        
        for (let i = 1, x = 0, y = 0; i <= range ** 2 ; i++) {
            x = $gamePlayer.x - Math.floor((range - 1) / 2) + Math.floor((i + 1) % range);
            y = $gamePlayer.y - Math.floor((range - 1) / 2) + Math.floor((i - 1) / range);
            const eventId = $gameMap.eventIdXy(x, y);

            if (eventId > 0) {
                //ID収集
                const obj = {eventId:eventId};
                targetArray.push(obj);
            };
        };
        
        for (let i = 1, obj = 0, id = 0; i <= targetArray.length; i++) {
            id = targetArray[i-1].eventId;
            obj = {x:$gameMap.event(id).x, y:$gameMap.event(id).y};
            animeTarget.push(obj);
        };
    }

    else if (atkType === "point") {
        const obj = {x:this.mouseMapX, y:this.mouseMapY};
        animeTarget.push(obj);
    }

    else if (atkType === "target") {
        const targetEventId = this.battlerArray[userEventId].normalAttackTargetId[0].eventId;
        
        const obj = {x:this.getXorY(targetEventId)._x, y:this.getXorY(targetEventId)._y};
        animeTarget.push(obj);
    }

    else if (atkType === "teleport") {
    }

    else if (atkType === "self") {
        const obj = {x:this.getXorY(userEventId)._x, y:this.getXorY(userEventId)._y};
        animeTarget.push(obj);
    };

    return animeTarget;
};

//攻撃範囲内の敵ID収集
Game_BattleSystems.prototype.sklTargetAry = function (userEventId, skillMeta) {
    const skillTargetId = [null];

    const atkType = JSON.parse(skillMeta.skillRange)[0];
    if (atkType === "direction") {
        let usercharaId = userEventId
        if (userEventId === 0) {usercharaId = - 1};

        const direct = this.getXorY(usercharaId).direction() / 2;
        const range = JSON.parse(skillMeta.skillRange);

        const rangeMod = [2, 1, 1, 2];
        const horRange = range[rangeMod[(direct - 1) % 4]];
        const verRange = range[rangeMod[(direct + 1) % 4]];
        const modX = [-Math.floor(horRange / 2), -horRange, 1, -Math.floor(horRange / 2)];
        const modY = [1, -Math.floor(verRange / 2), -Math.floor(verRange / 2), -verRange];
        const baseX = $gamePlayer.x + modX[direct - 1];
        const baseY = $gamePlayer.y + modY[direct - 1];

        for (let i = 1, eventId = 0; i <= horRange * verRange; i++) {
            const x = baseX + Math.floor( (i - 1) % horRange )
            const y = baseY + Math.floor( (i - 1) / horRange )
            const eventId = $gameMap.eventIdXy(x, y);
            const obj = {eventId:eventId}
            if (eventId != 0) {skillTargetId.push(obj)};
        };
    }

    else if (atkType === "scope") {
        const range = JSON.parse(skillMeta.skillRange)[1];      
        
        for (let i = 1, x = 0, y = 0; i <= range ** 2 ; i++) {
            x = $gamePlayer.x - Math.floor((range - 1) / 2) + Math.floor((i + 1) % range);
            y = $gamePlayer.y - Math.floor((range - 1) / 2) + Math.floor((i - 1) / range);
            const eventId = $gameMap.eventIdXy(x, y);

            if (eventId > 0) {
                //ID収集
                const obj = {eventId:eventId};
                skillTargetId.push(obj);
            };
        };
    }

    else if (atkType === "point") {

        const mouseMapX = battleSystems.mouseMapX;
        const mouseMapY = battleSystems.mouseMapY;
        
        const scope = JSON.parse(skillMeta.skillRange)[2];
        
        const baseX = mouseMapX - Math.floor(scope / 2);
        const baseY = mouseMapY - Math.floor(scope / 2);
        
        for (let i = 1, eventId = 0; i <= scope ** 2; i++) {
            const eventId = $gameMap.eventIdXy(baseX + (i - 1) % scope, baseY + Math.floor((i - 1) / scope))
            if ( eventId != 0 ) {
                const obj = {eventId:eventId}
                skillTargetId.push(obj);
            };
        };  
    }

    else if (atkType === "target") {
        const obj = this.battlerArray[userEventId].normalAttackTargetId[0];
        skillTargetId.push(obj);
    }

    else if (atkType === "teleport") {
    }

    else if (atkType === "self") {
        const obj = {eventId:userEventId}
        skillTargetId.push(obj);
    };

    return skillTargetId;
};

//アニメーション
Game_BattleSystems.prototype.decideAnimation = function(battlerIndex, skillId) {
    if (skillId === 1) {
        const weaponId = this.battlerArray[battlerIndex].selectedWeaponId;
        const animationId = $dataWeapons[weaponId].animationId;
        return animationId;
    } else if (skillId != 1) {
        return $dataSkills[skillId].animationId;
    };
};

Game_BattleSystems.prototype.getAnimation = function() { 
    const battlerIndex = this.attackData[this.atkDataIndex].skillUserId;
    const skillId = this.attackData[this.atkDataIndex].skillId;
    return this.decideAnimation(battlerIndex, skillId);
}

//熟練度計算
//発動したスキルに対応した武器タイプを取得
//装備中武器の武器タイプを取得→その武器タイプが発動スキルに対応してるか
//対応していたらその武器の熟練度を取得
Game_BattleSystems.prototype.weaponProficiency = function (battlerIndex, skillId) {
    const demandedWeaponType = JSON.parse($dataSkills[skillId].meta.weaponType);
    const equipedWeaponId = this.battlerArray[battlerIndex].selectedWeaponId;
    const weaponType = $gameBattleSystems.weaponIdToType(equipedWeaponId).weaponType;

    const isMetDemand = demandedWeaponType.includes(equipedWeaponId);
    let proficiency = 0;
    if (isMetDemand) {
        proficiency = this.battlerArray[battlerIndex].weaponProficiency[weaponType];
    } else {
        proficiency = 0;
    };
    return Number(proficiency);
};

//武器タイプIDを武器タイプ名に変換
Game_BattleSystems.prototype.weaponIdToType = function (equipedWeaponId) {
    const weaponTypeId = $dataWeapons[equipedWeaponId].wtypeId;

    const table = [
        {weaponTypeId:null, weaponType:"martialArts"},
        {weaponTypeId:1, weaponType:"sword"},
        {weaponTypeId:2, weaponType:"spear"},
        {weaponTypeId:3, weaponType:"axes"},
        {weaponTypeId:4, weaponType:"hammer"},
        {weaponTypeId:5, weaponType:"martialArts"},
        {weaponTypeId:6, weaponType:"throwing"},
        {weaponTypeId:7, weaponType:"sword"},
        {weaponTypeId:8, weaponType:"rod"},
        {weaponTypeId:9, weaponType:"scripture"},
        {weaponTypeId:10, weaponType:"mageGun"},
        {weaponTypeId:11, weaponType:"martialArts"},
       ];
       
    const weaponType = table[weaponTypeId];
    return weaponType;
};

//スキルコスト
Game_BattleSystems.prototype.getCost = function(attacker, skill) {
    const skillData = $dataSkills[skill];
    const mpConsume = skillData.mpCost

    return {mp:mpConsume};
};

Game_BattleSystems.prototype.consumeCost = function () {
    const attacker = this.attackData[this.atkDataIndex].skillUserId;
    const skill = this.attackData[this.atkDataIndex].skillId;

    const cost = this.getCost(attacker, skill);

    this.battlerArray[attacker].mp -= cost.mp;
};

//ダメージ計算
//命中判定→ダメージ計算→結果をダメージ結果配列に格納xスキル発動回数分
//↑この処理を攻撃範囲内の敵の数だけ行う
//その後、まとめてダメージ反映処理を行う

//命中判定目標
Game_BattleSystems.prototype.sklHitGoal = function (attacker, target, skill) {
    const skillData = $dataSkills[skill];

    const a = this.battlerArray[attacker].status();
    const b = this.battlerArray[target].status();
    
    const sklAim = skillData.successRate;
    const proficiency = this.weaponProficiency(attacker, skill);
    
    const hit = a.dex + a.agi + sklAim + proficiency;
    const eva = b.dex + b.agi;

    const goal = hit - eva;

    return goal;

};

//命中判定
Game_BattleSystems.prototype.damageModByHit = function (attacker, target, skill) {
    const goal = this.sklHitGoal(attacker, target, skill);
    const random = Math.floor(Math.random() * 100 + 1);

    let damageModByHit = 0;
    if (random <= goal / 4) {
        damageModByHit = 300;
    } else if (random <= goal / 2) {
        damageModByHit = 100;
    } else if (random <= goal) {
        damageModByHit = 50;
    } else if (random > goal) {
        damageModByHit = 0;
    };

    this.tempDamageModByHit = damageModByHit;
    return damageModByHit;
};

//ダメージ計算式を実行
Game_BattleSystems.prototype.damageCalculate = function (attacker, target, skill) {
    const a = this.battlerArray[attacker].status();
    const b = this.battlerArray[target].status();
    
    const skillData = $dataSkills[skill];
    const damageModByHitLv = this.damageModByHit(attacker, target, skill);
    
    //ダメージ計算
    //console.log({fomula:eval(skillData.damage.formula), mod:battleSystems.damageModByHit});
    const damage = eval(skillData.damage.formula) * damageModByHitLv / 100;
    return damage;
};

//ダメージ計算
Game_BattleSystems.prototype.onceDamage = function(attacker, target, skill) {
    const damage = this.damageCalculate(attacker, target, skill);
    return damage;
};

Game_BattleSystems.prototype.damageTarget = function (skill) {
    const skillData = $dataSkills[skill];
    const damageType = skillData.damage.type;
    if (damageType === 1 || damageType === 3 || damageType === 5) {
        damageTarget = "hp";
    } else if (damageType === 2 || damageType === 4 || damageType === 6) {
        damageTarget = "mp";
    };
    return damageTarget;
};

Game_BattleSystems.prototype.damageSign = function(skill) {
    //攻撃なのか回復なのか
    const skillData = $dataSkills[skill];
    const damageType = skillData.damage.type;

    let damageSign = 0;
    damageType === 3 || damageType === 4 ? damageSign = -1 : damageSign = 1;
    return damageSign;
};

Game_BattleSystems.prototype.executeDamage = function (target, skill, damage) {
    const skillData = $dataSkills[skill];
    const damageType = skillData.damage.type;
    let damageTarget = "";
    if (damageType === 1 || damageType === 3 || damageType === 5) {
        damageTarget = "hp";
    } else if (damageType === 2 || damageType === 4 || damageType === 6) {
        damageTarget = "mp";
    };

    this.battlerArray[target][damageTarget] -= damage;
};

Game_BattleSystems.prototype.drainCalcurale = function(attacker, skill, damage) {
    //HP/MP吸収攻撃の処理
    //<drain:["hp", 50]>
    const skillData = $dataSkills[skill];
    const damageType = skillData.damage.type;

    if(damageType === 5 || damageType === 6) {
        const drainData = JSON.parse(skillMeta.drain)
        const drainTarget = drainData[0];
        const drainRate = drainData[1];

        this.battlerArray[attacker][drainTarget] += damage * drainRate / 100; 
    };
};

//回復時に最大HP/MPを超えないようにする
Game_BattleSystems.prototype.notOverStatus = function(attacker, target) {
    this.battlerArray[attacker].hp = Math.min(this.battlerArray[attacker].hp, this.battlerArray[attacker].status().mhp)
    this.battlerArray[attacker].mp = Math.min(this.battlerArray[attacker].mp, this.battlerArray[attacker].status().mmp)

    this.battlerArray[target].hp = Math.min(this.battlerArray[target].hp, this.battlerArray[target].status().mhp)
    this.battlerArray[target].mp = Math.min(this.battlerArray[target].mp, this.battlerArray[target].status().mmp)
};

//////攻撃の処理//////

Game_BattleSystems.prototype.skillAttack = function(loop) {
    const atkDataIndex = this.atkDataIndex;
    const attacker = this.attackData[atkDataIndex].skillUserId;
    this.tempAttacker = attacker;
    const targetNum = this.attackData[atkDataIndex].skillTargetId.length - 1;
    this.tempTargetNum = targetNum;
    const targetIndex = this.loop(loop, targetNum).targetIndex;
    this.tempTargetIndex = targetIndex;
    const targetId = this.attackData[atkDataIndex].skillTargetId[targetIndex + 1].eventId;
    this.tempTargetId = targetId;
    const skill = this.attackData[atkDataIndex].skillId;

    const damage = this.damageSign(skill) * this.onceDamage(attacker, targetId, skill);
    this.tempDamage = damage;

    this.executeDamage(targetId, skill, damage);
    this.drainCalcurale(attacker, skill, this.onceDamage(attacker, targetId, skill));

    this.notOverStatus(attacker, targetId);
};

//回避先座標決定
Game_BattleSystems.prototype.decideEvaPoint = function(evaChara) {
    let chara = 0;
    evaChara != 0 ? chara = -1 : chara = evaChara;

    const evaCharaX = this.getXorY(chara).x;
    const evaCharaY = this.getXorY(chara).y;

    let moveX = 0;
    let moveY = 0;
    let towardX = 0;
    let towardY = 0;
   
    for (let movable = false; movable === false;) {
        moveX = Math.floor(Math.random() * (2+1) - 1);
        moveY = Math.floor(Math.random() * (2+1) - 1);
        towardX = evaCharaX + moveX;
        towardY = evaCharaY + moveY;
    
        let condition = 0;
        $gameMap.eventIdXy(towardX, towardY) > 0 ? condition += 1 : condition += 0;
        moveX === 0 && moveY === 0 ? condition += 1 : condition += 0;
        towardX < MIN_X || towardX > MAX_X ? condition += 1 : condition += 0;
        towardY < MIN_Y || towardY > MAX_Y ? condition += 1 : condition += 0;
   
     if (condition === 0) {movable = true};
    };

    return {moveX:moveX, moveY:moveY};
};

//回避時のキャラの動き
Game_BattleSystems.prototype.evaActionList = function(paramObj) {
    const evaAction = {
        "list":[
            {"code":35},
            {"code":44,"parameters":[{"name":"MISS","volume":20,"pitch":100,"pan":0}]},
            {"code":14, "parameters":[paramObj.moveX, paramObj.moveY]}, 
            {"code":36}, 
            {"code":0}
        ],
       "repeat":false, 
       "skippable":true,
    };
    return evaAction;
};

////ステート付与////
////ステート付与////
//スキルの追加効果で付与されるステートのデータの配列を取得
Game_BattleSystems.prototype.getSkillEffectStateData = function(skillId) {
    const effects = $dataSkills[skillId].effects;
    let stateArray = [];
    for (let i = 1; i >= effects.length ; i++) {
        if (effects[i-1].code === 21) {
            stateArray.push($dataStates[effects[i-1].dataId]);
        };
    };
    return stateArray;
};

//ステートを付与
Game_BattleSystems.prototype.addState = function(battlerIndex, stateId) {
    const stateArray = this.battlerArray[battlerIndex].state;

    let isAddedState = false;
    let numAddedState = null;
    for (let i = 1 ; i <= stateArray.length ; i++) {
        if (stateArray[i].id === stateId) {
            isAddedState = true;
            numAddedState = i;
        };
    };

    const max = $dataStates[stateId].maxTurns;
    const min = $dataStates[stateId].minTurns;

    if (this.isAddedState(stateId) === true) {
        const lastingTurn = Math.random() * (max - min + 1) + min;
        this.state[numAddedState].leftTurn = Math.max(this.state[numAddedState].leftTurn, lastingTurn);
    } else {
        const stateData = $dataStates[stateId];
        stateData.leftTurn = Math.random() * (max - min + 1) + min;

        this.state.push(stateData);
    };
};


//ターンごとのステートに関する処理

//歩行でのターン経過を無効化
Game_Actor.prototype.stepsForTurn = function() {
    return 0;
};

//１つの
Game_BattleSystems.prototype.turnProcessOfState = function(battlerIndex) {
    const stateArray = this.battlerArray[battlerIndex].state;
    //ステート継続数を-1、0だったら解除
    for (let i = 1 ; i <= stateArray.length - 1 ; i++) {
        stateArray[i].leftTurn -= 1;
        if (stateArray[i].leftTurn <= 0) {
            stateArray.splice(i,1);
        };
    }
};

////追加能力値に関する処理////
////追加能力値に関する処理////

Game_BattleSystems.prototype.turnRefleshAll = function() {
    for (let i = 1; i <= this.enemyNum; i++) {
        this.turnAddStatusReflesh(i-1);
    };
};

Game_BattleSystems.prototype.spStateReflesh = function() {
    //HP満タン時に能力値増加のステート
};

Game_BattleSystems.prototype.turnAddStatusReflesh = function(battlerIndex) {
    this.battlerArray[battlerIndex].addStatus = {};

    ////////////////////////////
    ////通常能力値に関する特徴////
    ////////////////////////////

    //攻撃力倍率
    const atkObj = {code:21, dataId:2};
    this.battlerArray[battlerIndex].addStatus.atkRate = this.getTurnRate(battlerIndex, atkObj);

    //防御倍率
    const defObj = {code:21, dataId:3};
    this.battlerArray[battlerIndex].addStatus.defRate = this.getTurnRate(battlerIndex, defObj);

    //魔力倍率
    const matObj = {code:21, dataId:4};
    this.battlerArray[battlerIndex].addStatus.defRate = this.getTurnRate(battlerIndex, matObj);

    //魔防倍率
    const mdfObj = {code:21, dataId:5};
    this.battlerArray[battlerIndex].addStatus.mdfRate = this.getTurnRate(battlerIndex, mdfObj);

    //敏捷倍率
    const agiObj = {code:21, dataId:6};
    this.battlerArray[battlerIndex].addStatus.agiRate = this.getTurnRate(battlerIndex, agiObj);

    /////////////////
    ////追加能力値////
    /////////////////

    //HP再生率
    const hpRgnObj = {code:22, dataId:7};
    this.battlerArray[battlerIndex].addStatus.hpRgn = this.getTurnRate(battlerIndex, hpRgnObj);

    //MP再生率
    const mpRgnObj = {code:22, dataId:8};
    this.battlerArray[battlerIndex].addStatus.mpRgn = this.getTurnRate(battlerIndex, mpRgnObj);

    //回避
    const evaObj = {code:22, dataId:1};
    this.battlerArray[battlerIndex].addStatus.eva = this.getTurnRate(battlerIndex, evaObj);

    //魔法反射
    const reflectMagicObj = {code:22, dataId:5};
    this.battlerArray[battlerIndex].addStatus.reflectMagic = this.getTurnRate(battlerIndex, reflectMagicObj);

    //反撃
    const countorObj = {code:22, dataId:6};
    this.battlerArray[battlerIndex].addStatus.counter = this.getTurnRate(battlerIndex, countorObj);

    /////////////////
    ////特殊能力値////
    /////////////////

    //MP消費率
    const mpCostCutObj = {code:23, dataId:4};
    this.battlerArray[battlerIndex].addStatus.mpCostCut = this.getTurnRate(battlerIndex, mpCostCutObj);

    /////////////////
    ////追加スキル////
    /////////////////

    //通常攻撃のHP吸収率
    this.battlerArray[battlerIndex].addStatus.hpDrainRate_passive = this.getTurnRate_Ori(battlerIndex, "hpDrainRate_passive");

    //通常攻撃のMP吸収率
    this.battlerArray[battlerIndex].addStatus.mpDrainRate_passive = this.getTurnRate_Ori(battlerIndex, "mpDrainRate_passive");

    //会心攻撃倍率
    this.battlerArray[battlerIndex].addStatus.critialAttackDamageRate = this.getTurnRate_Ori(battlerIndex, "critialAttackDamageRate");
};

//HP再生率とかの率を取得
Game_BattleSystems.prototype.getTurnRate = function(battlerIndex, traitObj) {
    let traitRate = 0;
    //装備
    const equipArray = this.battlerArray[battlerIndex].equip();
    traitRate += this.traitsCalculate(battlerIndex, equipArray, traitObj);

    //パッシブスキル
    const passiveSkillArray = this.battlerArray[battlerIndex].skill();
    let PassiveStateArray = [];
    for (let i = 1 ; i <= passiveSkillArray.length - 1 ; i++) {
        if (passiveSkillArray[i].meta.passiveState != undefined) {
            const stateData = $dataStates[evval(passiveSkillArray[i].meta.passiveState)];
            PassiveStateArray.push(stateData);
        };
    };
    traitRate += this.traitsCalculate(battlerIndex, PassiveStateArray, traitObj);

    //ステート
    const stateArray = this.battlerArray[battlerIndex].state;
    traitRate += this.traitsCalculate(battlerIndex, stateArray, traitObj);

    return traitRate;
};

//デフォルト実装の能力値の取得
Game_BattleSystems.prototype.traitsCalculate = function (battlerIndex, array, traitObj) {
    let result = 0;
    for (let i = 1 ; i <= array.length - 1 ; i++) {
        if (array[i] != undefined) {
            const traits = array[i-1].traits;
            if (traits.code === traitObj.code && traits.dataId === traitObj.dataId) {
                let value = 0
    
                //特性発動に条件がある場合
                const meta = array[i-1].meta;
                if (this.isTraitConditionOn(battlerIndex, meta)) {
                    //定数の場合
                    value = traits.value;
                    //変数の場合
                    const code = String(traitObj.code);
                    const traitValue = array[i-1].meta[code];
    
                    if (traitValue != undefined) {value = traitValue};                
                };
    
                result += value * 100 - 100;
            };   
        };
    };
    return result;
};

//特性関連で追加した条件式が満たされているかどうか
Game_BattleSystems.prototype.isTraitConditionOn = function(battlerIndex, meta) {
    const condition = meta.condition;
    let result = false;
    if (condition === undefined) {
        //条件式が設定されていない
        result = true;
    } else {
        const a = this.battlerArray[battlerIndex].status();
        eval(condition) ? result = true : result = false;
    };
    return result;
};

//オリジナルの能力値の率を取得
Game_BattleSystems.prototype.getTurnRate_Ori = function(battlerIndex, param) {
    let traitRate_Ori = 0;
    //装備
    const equipArray = this.battlerArray[battlerIndex].equip();
    traitRate_Ori += this.traitsCalculate_Ori(battlerIndex, equipArray, param);

    //パッシブスキル
    const passiveSkillArray = this.battlerArray[battlerIndex].skill();
    let PassiveStateArray = [];
    for (let i = 1 ; i <= passiveSkillArray.length - 1 ; i++) {
        if (passiveSkillArray[i].meta.passiveState != undefined) {
            const stateData = $dataStates[eval(passiveSkillArray[i-1].meta.passiveState)];
            PassiveStateArray.push(stateData);
        };
    };
    traitRate_Ori += this.traitsCalculate_Ori(battlerIndex, PassiveStateArray, param);

    //ステート
    const stateArray = this.battlerArray[battlerIndex].state;
    traitRate_Ori += this.traitsCalculate_Ori(battlerIndex, stateArray, param);

    return traitRate_Ori;
};

//オリジナルの能力値の取得
Game_BattleSystems.prototype.traitsCalculate_Ori = function (battlerIndex, array, param) {
    let result = 0;
    for (let i = 1 ; i <= array.length - 1 ; i++) {
        if (array[i] != undefined) {
            const meta = array[i].meta;
            if (meta[param] != undefined) {
                
                //特性発動に条件がある場合
                if (this.isTraitConditionOn(battlerIndex, meta)) {
                    //定数の場合
                    value = eval(meta[param]);           
                };
                result += value;
            };
        };      
    };
    return result;
};

//敵イベント消滅
Game_BattleSystems.prototype.enemyEliminated = function(eventId) {
    //battlerArrayで死亡扱いにする
    $gameBattleSystems.battlerArray[eventId] = "dead"; 
    //消滅関連の共通処理
    this.enemyNum -= 1;
};

//ターゲット配列と発動回数をループ回数から算出
Game_BattleSystems.prototype.loop = function (loop, targetNum) {
    //(ループ回数 - 1) / 対象の数 + 1 発動回数　(ループ回数 - 1) / 対象の数　配列の順番
    const repeat = Math.floor(loop / targetNum);
    //(ループ回数 - 1) % 対象の数 + 1 対象の順番　(ループ回数 - 1) % 対象の数　配列の順番
    const targetIndex = Math.floor(loop % targetNum);
    this.loopResult = {skillRepeat:repeat, targetIndex:targetIndex};
    return {skillRepeat:repeat, targetIndex:targetIndex};
};

Game_BattleSystems.prototype.loopMax = function (param1, param2) {
    this.loopMax = param1 * param2;
    return param1 * param2;
};

})();

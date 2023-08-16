//=============================================================================
// RPG Maker MZ - GTT_BattleSystem
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 
 * @author Getatumuri
 *
 * @help GTT_BattleSystem.js
 *
 * 
 * 
 * It does not provide plugin commands.
 */

/*:ja
 * @target MZ
 * @plugindesc SRPG的なバトルシステムを実装する
 * @author Getatumuri
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
 * 
 * 
 * @command ACTIVATE
 * @text スキル発動のデータ上の処理
 * @desc 
 * 
 * @command CREATE_ANIME_EVENT
 * @text イベントデータ生成
 * @desc アニメーション用イベントの情報を生成
 * 
 * @arg name
 * @test イベント名
 * @desc アニメーション用イベントの名前
 * @type string
 * @default "AnimationTarget"
 * 
 * @command PLAY_ANIMATION
 * @text アニメーション再生
 * @desc 攻撃アニメーション再生
 * 
 * 
 */

(() => {
    'use strict';

const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
const parameters = PluginManager.parameters(pluginName);
const script = document.currentScript;

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

//プラグインコマンド
PluginManagerEx.registerCommand(script, 'ACTIVATE', () => {
    $gameBattleSystems.skillActivate();
});

PluginManagerEx.registerCommand(script, 'CREATE_ANIME_EVENT', (arg) => {
    $gameBattleSystems.createSkillTargetEventsList(arg.name);
});

PluginManagerEx.registerCommand(script, 'PLAY_ANIMATION', () => {
    $gameBattleSystems.requestAnimations(); //アニメーション再生
    $gameBattleSystems.eraseAnimeEvents(); //アニメーション用イベントの消去
});

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
    this._attackData = [];
    this.debug = {};
    this._battlerList = [];
    this._playerAdditionalStatus = {
        _dex:50, //要改変
        _weaponProficiency:{
            //物理
            martialArts:0,
            sword:0,
            spear:0,
            axes:0,
            hammer:0,
            throwing:0,
            //魔法
            rod:0,
            scripture:0,
            flute:0,
            mageGun:0,
        }
    }
};

Game_BattleSystems.prototype.attackData = function() {
    return this._attackData;
};

Game_BattleSystems.prototype.attackDataIndex = function() {
    return this._attackDataIndex;
};

Game_BattleSystems.prototype.battlerList = function() {
    return this._battlerList;
};

////■■■■■■■■■■■////
////エンカウント////
////■■■■■■■■■■■////

//プレイヤーがエンカウントした位置の情報
Game_BattleSystems.prototype.encountRegion = function(x, y) {
    const obj = {
        _region:$gameMap.regionId(x, y),
        _mapEncountList:$dataMap.encounterList
    }
    return obj;
};

//敵グループ決定
Game_BattleSystems.prototype.encountTroop = function(x, y) {
    const region = this.encountRegion(x, y)._region;
    const mapEncountList = this.encountRegion(x, y)._mapEncountList;

    const encountList = mapEncountList.filter((v) => {
        // if(v.regionSet.includes(region)) {
        //     return encountList.push(v.troopId);
        // }
        return v.regionSet.includes(region);
    });

    const encountTroopGropeId = encountList[Math.floor(Math.random() * encountList.length)].troopId;
    const encountEnemyNum = $dataTroops[encountTroopGropeId].members.length;
    const battlerList = new Array(encountEnemyNum + 1);

    this._battlerList = battlerList;
    this._encountTroopGropeId = encountTroopGropeId;
    this._encountEnemyNum = encountEnemyNum;
    this._enemyNum = encountEnemyNum;
};

//プレイヤースポーン位置を決定
Game_BattleSystems.prototype.playerSpawn = function() {
    const obj = {
        _x:Math.floor(Math.random() * (MAX_X - MIN_X + 1)) + MIN_X,
        _y:Math.floor(Math.random() * (MAX_Y - MIN_Y + 1)) + MIN_Y,
    };
    return obj;
}

//敵スポーン位置を決定
Game_BattleSystems.prototype.enemySpawn = function(enemyNum) {
    const centerX = ((MIN_X + MAX_X) / 2);
    const centerY = ((MIN_Y + MAX_Y) / 2);
    const signX = Math.sign($gamePlayer.x - centerX);
    const signY = Math.sign($gamePlayer.y - centerY);

    const enemyPositionList = [];
    for (let i = 1; i <= enemyNum; i++) {

        for (let loop = false ; loop != true ;) {
            const xEnmMod = Math.floor(Math.random() * ((centerX - 1) / 2 + 1));
            const yEnmMod = Math.floor(Math.random() * ((centerY - 1) / 2 + 1));
        
            const enemySetX = centerX + xEnmMod * signX;
            const enemySetY = centerY + yEnmMod * signY;

            let anythingExist = enemyPositionList.some(v => {v.x === enemySetX && v.y === enemySetY});
        
            if ($gamePlayer.x != enemySetX && $gamePlayer.y != enemySetY &&
               anythingExist != true) {
                enemyPositionList.push({_x:enemySetX, _y:enemySetY});
                loop = true
            };
        };
    };

    this._enemyPositionList = enemyPositionList;

};

Game_BattleSystems.prototype.enemyPositionList = function () {
    return this._enemyPositionList;
};

//能力値オブジェクト配列生成
Game_BattleSystems.prototype.createStatusObject = function(troopId) {
    this.createEnemyData(troopId);
    this.createPlayerData();
    this.createCoolTimeObj();
    this.decideActGaugeMax();
};

// class ememyObj {
//     constructor(eventId, dataId) {
//         this._eventId = eventId;
//         this._dataId = dataId;
//         this._hp = $dataEnemies[this._dataId].params[0];
//         this._mp = $dataEnemies[this._dataId].params[1];
//         this._statusBuffs = {};
//         this._spStatus = {};
//         this._selectedWeaponId = ENEMY_WEAPON;
//         this._state = [null];
//         this._actQ = 0;
//         this._actGauge = 0;
//         this._normalAttackTargetId = [{_eventId:0}];
//     }
//     weaponProficiency() {
//         const p = $dataEnemies[this._dataId].meta.weaponProficiency;
//         return {
//             //物理
//             martialArts:p,
//             sword:p,
//             spear:p,
//             axes:p,
//             hammer:p,
//             throwing:p,
//            //魔法
//             rod:p,
//             scripture:p,
//             flute:p,
//             mageGun:p            
//         }
//     }
//     status() {
//         const id = this._dataId;
//         return {
//             "mhp":$dataEnemies[id].params[0],
//             "mmp":$dataEnemies[id].params[1],
//             "atk":$dataEnemies[id].params[2],
//             "def":$dataEnemies[id].params[3],
//             "mat":$dataEnemies[id].params[4],
//             "mdf":$dataEnemies[id].params[5],
//             "agi":$dataEnemies[id].params[6],
//             "luk":$dataEnemies[id].params[7],
//             "dex":JSON.parse($dataEnemies[id].meta.addBaseStatus)[0]
//         }
//     }
//     statusBuffs() {
//         return this._statusBuffs;
//     }
//     grossStatus() {
//         return {
//             "hp":this._hp,
//             "mp":this._mp,
//             "mhp":this.status().mhp * (this.statusBuffs().mhpRate + 100),
//             "mmp":this.status().mmp * (this.statusBuffs().mmpRate + 100),
//             "atk":this.status().atk * (this.statusBuffs().atkRate + 100),
//             "def":this.status().def * (this.statusBuffs().defRate + 100),
//             "mat":this.status().mat * (this.statusBuffs().matRate + 100),
//             "mdf":this.status().mdf * (this.statusBuffs().mdfRate + 100),
//             "agi":this.status().agi * (this.statusBuffs().agiRate + 100),
//             "luk":this.status().luk,
//             "dex":this.status().dex,
//         }
//     }
//     equip() {
//         return [$dataWeapons[this._selectedWeaponId]];
//     }
//     skill() {
//         return $gameBattleSystems.skillsList(this._eventId);
//     }
// }

class battler {
    constructor(eventId, dataId, hp, mp, status, weaponProficiency, weaponId, nAttackTargetId) {
        this._eventId = eventId;
        this._dataId = dataId;
        this._hp = hp;
        this._mp = mp;
        this._status = status;
        this._statusBuffs = {};
        this._spStatus = {};
        this._weaponProficiency = weaponProficiency;
        this._selectedWeaponId = weaponId;
        this._state = [null];
        this._actQ = 0;
        this._actGauge = 0;
        this._normalAttackTargetId = [{_eventId:nAttackTargetId}];
    }
    //HP/MP関連
    hp() {return this._hp;}
    gainHp(value) {this._hp = Math.max(Math.min(this._hp + value, this.status().mhp), 0);}
    mp() {return this._mp;}
    gainMp(value) {this._hp = Math.max(Math.min(this._mp + value, this.status().mmp), 0);}
    //能力値関連
    status() {return this._status;}
    grossStatus(key) {return this.status()[key] * (this.statusBuffs()[`${key}Rate`] + 100);}
    weaponProficiency() {return this._weaponProficiency;}
    //バフ関連
    statusBuffs() {return this._statusBuffs;}
    addStatusBuffs(key, rate, turn) {
        this._statusBuffs[key].push({rate:rate, turn:turn});
    }
    //特殊能力値関連
    spStatus() {return this._spStatus;}
    //ステート関連
    state() {return this._state;}
    addState(key, turn) {
        this._state[key].push(turn);
    }

    equip() {
        return [$dataWeapons[this._selectedWeaponId]];
    }
    skill() {
        return $gameBattleSystems.skillsList(this._eventId);
    }
}

Game_BattleSystems.prototype.addBattler = function(index, battlerData) {
    this._battlerList[index] = battlerData;
}

//敵能力値オブジェクト生成
Game_BattleSystems.prototype.createEnemyData = function(troopId) {
    $dataTroops[troopId].members.forEach((v, i) => {
        const enemyId = v.enemyId
        const hp = $dataEnemies[enemyId].params[0];
        const mp = $dataEnemies[enemyId].params[1];
        const status = {
            "mhp":$dataEnemies[enemyId].params[0],
            "mmp":$dataEnemies[enemyId].params[1],
            "atk":$dataEnemies[enemyId].params[2],
            "def":$dataEnemies[enemyId].params[3],
            "mat":$dataEnemies[enemyId].params[4],
            "mdf":$dataEnemies[enemyId].params[5],
            "agi":$dataEnemies[enemyId].params[6],
            "luk":$dataEnemies[enemyId].params[7],
            "dex":JSON.parse($dataEnemies[enemyId].meta.addBaseStatus)[0]
        };
        const p = JSON.parse($dataEnemies[enemyId].meta.weaponProficiency);
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
        }
        const weaponId = ENEMY_WEAPON;
        this.addBattler(i + 1, new battler(i + 1, enemyId, hp, mp, status, weaponProficiency, weaponId, 0));//eventId, dataId, hp, mp, status, weaponId, nAttackTargetId
    });
};

//プレイヤーオブジェクト生成
// Game_BattleSystems.prototype.createPlayerData = function () {

//     const status = function() {
//         const getStatus = {
//             "mhp":$gameActors.actor(1).param(0),
//             "mmp":$gameActors.actor(1).param(1),
//             "atk":$gameActors.actor(1).param(2),
//             "def":$gameActors.actor(1).param(3),
//             "mat":$gameActors.actor(1).param(4),
//             "mdf":$gameActors.actor(1).param(5),
//             "agi":$gameActors.actor(1).param(6),
//             "luk":$gameActors.actor(1).param(7),
//             "dex":$gameVariables.value(STATUS_VARIABLE).dex
//         };
//         return getStatus;
//     };

//     const originalStatus = $gameVariables.value(STATUS_VARIABLE);
//     const weaponProficiency = originalStatus.weaponProficiency;
    
//     const playerObj = {
//         _eventId:0,
//         status:status,
//         _statusBuffs:{},
//         _spStatus:{},
//         _hp:$gameActors.actor(1).hp,
//         _mp:$gameActors.actor(1).mp,
//         _weaponProficiency:weaponProficiency,
//         equip:function() {return $gameParty.members()[0].equips()},
//         skill:function() {return $gameBattleSystems.skillsList(0)},
//         _selectedWeaponId:0,
//         _state:[null],
        
//         _actQ:0,
//         _actGauge:0
//     };

//     status()._hp = playerObj._hp;
//     status()._mp = playerObj._mp;

//     this._battlerList[0] = playerObj;

//     //this._battlerList[battlerIndex].statusBuffs.atkRate
//     //

//     const grossStatus = function() {
//         const battlerData = $gameBattleSystems.battlerList()[0];
//         const getGrossStatus = {
//             "hp":battlerData._hp,
//             "mp":battlerData._mp,
//             "mhp":battlerData.status().mhp * (battlerData.statusBuffs().mhpRate + 100),
//             "mmp":battlerData.status().mmp * (battlerData.statusBuffs().mmpRate + 100),
//             "atk":battlerData.status().atk * (battlerData.statusBuffs().atkRate + 100),
//             "def":battlerData.status().def * (battlerData.statusBuffs().defRate + 100),
//             "mat":battlerData.status().mat * (battlerData.statusBuffs().matRate + 100),
//             "mdf":battlerData.status().mdf * (battlerData.statusBuffs().mdfRate + 100),
//             "agi":battlerData.status().agi * (battlerData.statusBuffs().agiRate + 100),
//             "luk":battlerData.status().luk,
//             "dex":battlerData.status().dex,
//         };
//         return getGrossStatus;
//     };

//     this._battlerList[0].grossStatus = grossStatus;

// };

Game_BattleSystems.prototype.createPlayerData = function () {
    const hp = $gameActors.actor(1).hp;
    const mp = $gameActors.actor(1).mp;
    const status = {
        "mhp":$gameActors.actor(1).param(0),
        "mmp":$gameActors.actor(1).param(1),
        "atk":$gameActors.actor(1).param(2),
        "def":$gameActors.actor(1).param(3),
        "mat":$gameActors.actor(1).param(4),
        "mdf":$gameActors.actor(1).param(5),
        "agi":$gameActors.actor(1).param(6),
        "luk":$gameActors.actor(1).param(7),
        "dex":this._playerAdditionalStatus._dex
    };
    const weaponProficiency = this._playerAdditionalStatus._weaponProficiency;
    const weaponId = 4;//武器ID
    const nAttackTargetId = 1;

    this.addBattler(0, new battler(0, 0, hp, mp, status, weaponProficiency, weaponId, nAttackTargetId));//eventId, dataId, hp, mp, status, weaponProficiency, weaponId, nAttackTargetId
};

//CTオブジェクト生成
Game_BattleSystems.prototype.createCoolTimeObj = function () {
    for (let i = 0 ; i < this.battlerList().length ; i++) {
        const battlerIndex = i;
        const skillsList = this.skillsList(battlerIndex);
        const skillNum = skillsList.length;
        this._battlerList[i]._coolTimeObj = new Array(skillNum);

        for (let j = 1 ; j <= skillsList.length - 1 ; j++) {
            const skillIndex = j;
            this._battlerList[battlerIndex]._coolTimeObj[skillIndex] = {};

            if (skillsList[skillIndex].stypeId === ULTIMATE_SKILLTYPE) {                
                this._battlerList[battlerIndex]._coolTimeObj[skillIndex]._coolTime = 0;
                this._battlerList[battlerIndex]._coolTimeObj[skillIndex]._coolTimeMax = skillsList[skillIndex].tpCost * COOLTIME_CORRECTIONVALUE;        
            } else {
                this._battlerList[battlerIndex]._coolTimeObj[skillIndex] = null;
            };
        };

    };
};

//行動ゲージの長さ決定
Game_BattleSystems.prototype.decideActGaugeMax = function () {
    const battlerList = this.battlerList();
    const agiList = [];
    for (let i = 0; i < battlerList.length; i++) {
        const agi = eval(this.battlerList()[i].status().agi);
        agiList.push(agi);
    };
    
    const ListMax = function (a, b) {return Math.max(a, b);}
    let max = agiList.reduce(ListMax);
    
    this._actGaugeMax = Math.floor(max * 5 / 10) * 10;
};

//ウルトボタン生成関連


////■■■■■■■■■////
////ターン進行////
////■■■■■■■■■////

//ターンごとのatkData配列初期化
Game_BattleSystems.prototype.attackDataClear = function () {
    this._attackData = [];
}

//行動ゲージ更新
Game_BattleSystems.prototype.addActGauge = function () {
    const length = this.battlerList().length
    const List = this.battlerList();
    for (let i = 1 ; i <= length ; i++) {
     if (List[i-1] != "dead") {
      const agi = List[i-1].status().agi;
      this._battlerList[i-1]._actGauge += agi;
     };
    };
};

//CT経過
Game_BattleSystems.prototype.coolTimeLapse_ALL = function () {
    const battlerList = this.battlerList();
    for (let i = 0 ; i < battlerList.length ; i++) {
        const battlerIndex = i;
        this.coolTimeLapse(battlerIndex);
    };
};

Game_BattleSystems.prototype.coolTimeLapse = function (battlerIndex) {
    const skillsList = this.skillsList(battlerIndex);
    for (let i = 1 ; i <= skillsList.length - 1 ; i++) {
        if (skillsList[i] != null) {
            const nowCoolTime = this.battlerList()[battlerIndex]._coolTimeObj[i]._coolTime;
            const coolTimeMax = this.battlerList()[battlerIndex]._coolTimeObj[i]._coolTimeMax;
            this._battlerList[battlerIndex]._coolTimeObj[i]._coolTime = Math.min(nowCoolTime + 1, coolTimeMax);            
        };
    };
};

//移動か通常攻撃か
Game_BattleSystems.prototype.moveOrAttack = function(eventId, skillId) {
    const battlerData = this.battlerList()[eventId];

    let skillMeta = 0;
    skillId != 1 ? 
        skillMeta = $dataSkills[skillId].meta :
        skillMeta = $dataWeapons[battlerData._selectedWeaponId].meta;

    const targetId = battlerData._normalAttackTargetId[0]._eventId;
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

    this._towardChara = targetId;
    return act;
};

//イベントの座標を取得
Game_BattleSystems.prototype.getXorY = function(eventId) {
    const chara = eventId > 0 ? $gameMap.event(eventId) : $gamePlayer;
    return {_x:chara.x, _y:chara.y, _direction:chara.direction()};
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
Game_BattleSystems.prototype.createAttackData = function (eventId) {
    const atkData = {
        _skillUserId:this.battlerList()[eventId]._eventId,
        _rockOnTargetId:this.battlerList()[eventId]._normalAttackTargetId[0],
    };
    return atkData;
};

//skillId:skillId,

//スキル配列を取得
Game_BattleSystems.prototype.skillsList = function (battlerIndex) {
    const eventId = this.battlerList()[battlerIndex]._eventId;
    let skillsList = [null];

    if (eventId != 0) {
        const enemyDataId = this.battlerList()[eventId]._dataId;      
        const length = $dataEnemies[enemyDataId].actions.length;

        for (let i = 1; i <= length; i++) {
         const obj = $dataSkills[$dataEnemies[enemyDataId].actions[i-1].skillId];
         skillsList.push(obj) 
        } ;

    } else if (eventId === 0) {
        skillsList = skillsList.concat($gameParty.members()[0].skills()); 
    };
 
    return skillsList;
};

//通常攻撃かアビリティか

//_attackDataIndexからbattlerIndexを取得
Game_BattleSystems.prototype.getBattlerIndex = function(attackDataIndex) {
    return this.attackData()[attackDataIndex]._skillUserId;
};

//アビリティを取得して格納
Game_BattleSystems.prototype.getAbilityId = function (battlerIndex) {
    const skillsList = this.skillsList(battlerIndex);
    // console.log(skillsList)
    const tempList = skillsList.filter((v) => {return v != null && v.stypeId === ABILITY_SKILLTYPE});
    //アビリティが複数の場合、ランダムでその一つになる
    const abilitySkill = tempList.length > 0 ? tempList[Math.floor(Math.random() * tempList.length)].id : 1;
    return abilitySkill;
};

Game_BattleSystems.prototype.decideAttackSkill = function (battlerIndex) {
    //通常攻撃時のスキルデータ、スキルor武器メタデータを格納
    let skillId = 1; //this.getNormalAttackSkill(battlerIndex);
    let skillData = $dataSkills[1];
    let skillMeta = $dataWeapons[this.battlerList()[battlerIndex]._selectedWeaponId].meta;

    //戦技値と武器熟練度を取得
    const userStatus = this.battlerList()[battlerIndex].status();
    const proficiency = this.weaponProficiency(battlerIndex, this.getAbilityId(battlerIndex));

    //目標値と乱数を生成
    const goal = this.getAbilityId(battlerIndex) > 1 ? (userStatus.dex + proficiency) / 2 : 0;
    const random = Math.floor(Math.random() * 100 + 1);
    
    //判定成功時のスキルデータ、スキルor武器メタデータを格納
    if (goal >= random) {
        skillId = this.getAbilityId(battlerIndex);
        skillData = $dataSkills[skillId];
        skillMeta = $dataSkills[skillId].meta;
    };

    return {_id:skillId, _skillData:skillData, _skillMeta:skillMeta};
};

Game_BattleSystems.prototype.getNormalAttackSkill = function(battlerIndex) {
    const weaponData = $dataWeapons[this.battlerList()[battlerIndex]._selectedWeaponId];
    let skillId = 1;
    if (this.battlerList()[battlerIndex]._selectedWeaponId != undefined) {
        for (let i = 1 ; i <= weaponData.traits.length ; i++) {
            if (weaponData.traits[i-1].code === 35) {
                skillId = weaponData.traits[i-1].dataId;
            };
        };
    };
    return skillId;
};

//範囲表示

//マウスのマップ上と画面上の座標取得
Game_BattleSystems.prototype.mouseMapPoint = function() {
    const inputX = Math.floor((TouchInput._x - 24) / 48); //48はマスの辺長
    const inputY = Math.floor((TouchInput._y - 6) / 48); //6はキャラクターのy座標補正
    
    const mouseMapX = Math.max(Math.min(inputX, MAX_X), MIN_X);
    const mouseMapY = Math.max(Math.min(inputY, MAX_Y), MIN_Y);

    this._mouseMapX = mouseMapX;
    this._mouseMapY = mouseMapY;
    this._targetScreenX = mouseMapX * 48 + 24 + 24;
    this._targetScreenY = mouseMapY * 48 + 24 + 6;
};

//スキル発動

//スキル発動に関するデータ上の処理
Game_BattleSystems.prototype.skillActivate = function() {
    const index = this.attackDataIndex();
    const battlerIndex = this.getBattlerIndex(index);
    
    //通常攻撃時、確率で特殊攻撃に変化
    const skill = this.decideAttackSkill(battlerIndex);
    this._attackData[index]._skillId = skill._id;
    this._attackData[index]._skillData = skill._skillData;
    this._attackData[index]._skillMeta = skill._skillMeta;
    //攻撃対象の敵IDの収集＋アニメ再生用イベントの座標を収集
    this.createListAboutTarget();
    //コスト
    this.consumeCost();
}

//攻撃対象収集＋スキルアニメーション再生用イベントの設置座標を配列に格納
Game_BattleSystems.prototype.createListAboutTarget = function() {
    const index = this.attackDataIndex();
    const userEventId = this.attackData()[index]._skillUserId;
    const skillData = this.attackData()[index]._skillData;
    const skillMeta = this.attackData()[index]._skillMeta;

    this._attackData[index]._skillTargetId = this.skillTargetList(userEventId, skillMeta);
    this._targetNum = this.skillTargetList(userEventId, skillMeta).length - 1;
    this._attackData[index]._animeTarget = this.skillAnimeTarget(userEventId, skillMeta);   
    this._loopMax = skillData.repeats * this.attackData()[index]._skillTargetId.length - 1;
};

// ================================================================
// 
// スキルアニメーション関係処理
// 
// ================================================================

//アニメーション再生
Game_BattleSystems.prototype.requestAnimations = function() {
    const targets = this.targetEventsIdList().map((v) => {return $gameMap.event(v)})
    const animeId = this.getAnimation();
    $gameTemp.requestAnimation(targets, animeId);
    
    //this._characterId = targetIds[targetIds.length - 1];
    //this.setWaitMode("animation");
}

//アニメーション再生用イベントの設置の準備
Game_BattleSystems.prototype.createSkillTargetEventsList = function(name) {
    const list = [...this.attackData()[this.attackDataIndex()]._animeTarget]
    for(const v of list) {
        if(v != null) {
            v._id = name;
            v._template = true;
        }
    }
}

//設置した再生用イベントのIDからアニメーション再生関数の引数を生成
Game_BattleSystems.prototype.targetEventsIdList = function() {
    const list = [...this.attackData()[this.attackDataIndex()]._animeTarget]
    const idList = [];
    for (let i = 0; i < list.length; i++) {
        if (list[i] != null) {
            // const id = list[i]._eventId
            // const chara = id > 0 ? $gameMap.event(id) : Game_Interpreter.prototype.character(-1);
            // idList.push(chara);
            idList.push(list[i]._eventId);
        }
    }
    return idList;
}

// //アニメーション再生用イベントの消去
Game_BattleSystems.prototype.eraseAnimeEvents = function() {
    const animeTarget = this.attackData()[this.attackDataIndex()]._animeTarget;
    
    for (let i = 1 ; i <= animeTarget.length - 1; i++) {
     $gameMap.eraseEvent(animeTarget[i]._eventId);
    };
}

//アニメーション再生用イベントの設置座標を配列に収める
Game_BattleSystems.prototype.skillAnimeTarget = function(userEventId, skillMeta) {
    const animeTarget = [null];

    const atkType = JSON.parse(skillMeta.skillRange)[0];
    if (atkType === "direction") {
        if (userEventId === 0) {userEventId = - 1};
        const charaDirect = this.getXorY(userEventId)._direction / 2;

        const range = JSON.parse(skillMeta.skillRange)[1];
        const coModList = [0, -1, 1, 0];
        
        const skillAnimetionX = $gamePlayer.x + coModList[(charaDirect - 1) % 4] * (range / 2 + 1);
        const skillAnimetionY = $gamePlayer.y + coModList[(charaDirect + 1) % 4] * (range / 2 + 1);
        
        const obj = {
         _x:Math.max(Math.min(skillAnimetionX, 14), 4),
         _y:Math.max(Math.min(skillAnimetionY, $gameMap.height() - 1), 0)
        };
        
        animeTarget.push(obj);
    }

    else if (atkType === "scope") {
        const range = JSON.parse(skillMeta.skillRange)[1];      
        const targetList = [];
        
        for (let i = 1, x = 0, y = 0; i <= range ** 2 ; i++) {
            x = $gamePlayer.x - Math.floor((range - 1) / 2) + Math.floor((i + 1) % range);
            y = $gamePlayer.y - Math.floor((range - 1) / 2) + Math.floor((i - 1) / range);
            const eventId = $gameMap.eventIdXy(x, y);

            if (eventId > 0) {
                //ID収集
                const obj = {_eventId:eventId};
                targetList.push(obj);
            };
        };
        
        for (let i = 1, obj = 0, id = 0; i <= targetList.length; i++) {
            id = targetList[i-1]._eventId;
            obj = {_x:$gameMap.event(id).x, _y:$gameMap.event(id).y};
            animeTarget.push(obj);
        };
    }

    else if (atkType === "point") {
        const obj = {_x:this._mouseMapX, _y:this._mouseMapY};
        animeTarget.push(obj);
    }

    else if (atkType === "target") {
        const targetEventId = this.battlerList()[userEventId]._normalAttackTargetId[0]._eventId;
        
        const obj = {_x:this.getXorY(targetEventId)._x, _y:this.getXorY(targetEventId)._y};
        animeTarget.push(obj);
    }

    else if (atkType === "teleport") {
    }

    else if (atkType === "self") {
        const obj = {_x:this.getXorY(userEventId)._x, _y:this.getXorY(userEventId)._y};
        animeTarget.push(obj);
    };

    return animeTarget;
};

//攻撃範囲内の敵ID収集
Game_BattleSystems.prototype.skillTargetList = function (userEventId, skillMeta) {
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

        for (let i = 1; i <= horRange * verRange; i++) {
            const x = baseX + Math.floor( (i - 1) % horRange )
            const y = baseY + Math.floor( (i - 1) / horRange )
            const eventId = $gameMap.eventIdXy(x, y);
            const obj = {_eventId:eventId}
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
                const obj = {_eventId:eventId};
                skillTargetId.push(obj);
            };
        };
    }

    else if (atkType === "point") {

        const mouseMapX = battleSystems._mouseMapX;
        const mouseMapY = battleSystems._mouseMapY;
        
        const scope = JSON.parse(skillMeta.skillRange)[2];
        
        const baseX = mouseMapX - Math.floor(scope / 2);
        const baseY = mouseMapY - Math.floor(scope / 2);
        
        for (let i = 1; i <= scope ** 2; i++) {
            const eventId = $gameMap.eventIdXy(baseX + (i - 1) % scope, baseY + Math.floor((i - 1) / scope))
            if ( eventId != 0 ) {
                const obj = {_eventId:eventId}
                skillTargetId.push(obj);
            };
        };  
    }

    else if (atkType === "target") {
        const obj = this.battlerList()[userEventId]._normalAttackTargetId[0];
        skillTargetId.push(obj);
    }

    else if (atkType === "teleport") {
    }

    else if (atkType === "self") {
        const obj = {_eventId:userEventId}
        skillTargetId.push(obj);
    };

    return skillTargetId;
};

//アニメーション
Game_BattleSystems.prototype.decideAnimation = function(battlerIndex, skillId) {
    if (skillId === 1) {
        const weaponId = this.battlerList()[battlerIndex]._selectedWeaponId;
        return $dataWeapons[weaponId].animationId;
    } else if (skillId != 1) {
        return $dataSkills[skillId].animationId;
    };
};

Game_BattleSystems.prototype.getAnimation = function() { 
    const battlerIndex = this.attackData()[this.attackDataIndex()]._skillUserId;
    const skillId = this.attackData()[this.attackDataIndex()]._skillId;
    return this.decideAnimation(battlerIndex, skillId);
}

//熟練度計算
//発動したスキルに対応した武器タイプを取得
//装備中武器の武器タイプを取得→その武器タイプが発動スキルに対応してるか
//対応していたらその武器の熟練度を取得
Game_BattleSystems.prototype.weaponProficiency = function (battlerIndex, skillId) {
    const demandedWeaponType = JSON.parse($dataSkills[skillId].meta.weaponType);
    const equipedWeaponId = this.battlerList()[battlerIndex]._selectedWeaponId;
    const weaponType = this.weaponIdToType(equipedWeaponId).weaponType;

    const isMetDemand = demandedWeaponType.includes(equipedWeaponId);
    let proficiency = 0;
    if (isMetDemand) {
        proficiency = this.battlerList()[battlerIndex].weaponProficiency()[weaponType];
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
    //スキルのコスト
    const skillData = $dataSkills[skill];
    const mpConsume = skillData.mpCost;

    //パッシブスキルによる補正

    return {_mp:mpConsume};
};

Game_BattleSystems.prototype.consumeCost = function () {
    const attacker = this.attackData()[this.attackDataIndex()]._skillUserId;
    const skill = this.attackData()[this.attackDataIndex()]._skillId;

    const cost = this.getCost(attacker, skill);

    this._battlerList[attacker]._mp -= cost._mp;
};

//ダメージ計算
//命中判定→ダメージ計算→結果をダメージ結果配列に格納xスキル発動回数分
//↑この処理を攻撃範囲内の敵の数だけ行う
//その後、まとめてダメージ反映処理を行う

//命中判定目標
Game_BattleSystems.prototype.skillHitGoal = function (attacker, target, skill) {
    const skillData = $dataSkills[skill];

    const a = this.battlerList()[attacker].status();
    const b = this.battlerList()[target].status();
    
    const skillAim = skillData.successRate;
    const proficiency = this.weaponProficiency(attacker, skill);
    
    const hit = a.dex + a.agi + skillAim + proficiency;
    const eva = b.dex + b.agi;

    const goal = hit - eva;

    return goal;

};

//命中判定
Game_BattleSystems.prototype.damageModByHit = function (attacker, target, skill) {
    const goal = this.skillHitGoal(attacker, target, skill);
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

    this._tempDamageModByHit = damageModByHit;
    return damageModByHit;
};

//ダメージ計算式を実行
Game_BattleSystems.prototype.damageCalculate = function (attacker, target, skill) {
    const a = this.battlerList()[attacker].status();
    const b = this.battlerList()[target].status();
    
    const skillData = $dataSkills[skill];
    const damageModByHitLv = this.damageModByHit(attacker, target, skill);
    
    //ダメージ計算
    // console.log({fomula:eval(skillData.damage.formula), mod:damageModByHitLv});
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
        damageTarget = "_hp";
    } else if (damageType === 2 || damageType === 4 || damageType === 6) {
        damageTarget = "_mp";
    };

    this._battlerList[target][damageTarget] -= damage;
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

        this._battlerList[attacker][`_${drainTarget}`] += damage * drainRate / 100; 
    };
};

//回復時に最大HP/MPを超えないようにする
Game_BattleSystems.prototype.notOverStatus = function(attacker, target) {
    this._battlerList[attacker]._hp = Math.min(this.battlerList()[attacker]._hp, this.battlerList()[attacker].status().mhp)
    this._battlerList[attacker]._mp = Math.min(this.battlerList()[attacker]._mp, this.battlerList()[attacker].status().mmp)

    this._battlerList[target]._hp = Math.min(this.battlerList()[target]._hp, this.battlerList()[target].status().mhp)
    this._battlerList[target]._mp = Math.min(this.battlerList()[target]._mp, this.battlerList()[target].status().mmp)
};

//////攻撃の処理//////

Game_BattleSystems.prototype.skillAttack = function(loop) {
    const attackDataIndex = this.attackDataIndex();
    const attacker = this.attackData()[attackDataIndex]._skillUserId;
    this._tempAttacker = attacker;
    const targetNum = this.attackData()[attackDataIndex]._skillTargetId.length - 1;
    this._tempTargetNum = targetNum;
    const targetIndex = this.loop(loop, targetNum)._targetIndex;
    this._tempTargetIndex = targetIndex;
    const targetId = this.attackData()[attackDataIndex]._skillTargetId[targetIndex + 1]._eventId;
    this._tempTargetId = targetId;
    const skill = this.attackData()[attackDataIndex]._skillId;

    const damage = this.damageSign(skill) * this.onceDamage(attacker, targetId, skill);
    this._tempDamage = damage;

    this.executeDamage(targetId, skill, damage);
    this.drainCalcurale(attacker, skill, this.onceDamage(attacker, targetId, skill));

    this.notOverStatus(attacker, targetId);
};

//回避先座標決定
Game_BattleSystems.prototype.decideEvaPoint = function(evaChara) {
    let chara = 0;
    evaChara != 0 ? chara = -1 : chara = evaChara;

    const evaCharaX = this.getXorY(chara)._x;
    const evaCharaY = this.getXorY(chara)._y;

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

    return {_moveX:moveX, _moveY:moveY};
};

//回避時のキャラの動き
Game_BattleSystems.prototype.evaActionList = function(paramObj) {
    const evaAction = {
        "list":[
            {"code":35},
            {"code":44,"parameters":[{"name":"MISS","volume":20,"pitch":100,"pan":0}]},
            {"code":14, "parameters":[paramObj._moveX, paramObj._moveY]}, 
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
    let stateList = [];
    for (let i = 1; i >= effects.length ; i++) {
        if (effects[i-1].code === 21) {
            stateList.push($dataStates[effects[i-1].dataId]);
        };
    };
    return stateList;
};

//ステートを付与
Game_BattleSystems.prototype.addState = function(battlerIndex, stateId) {
    const stateList = this.battlerList()[battlerIndex]._state;

    let isAddedState = false;
    let numAddedState = null;
    for (let i = 1 ; i <= stateList.length ; i++) {
        if (stateList[i].id === stateId) {
            isAddedState = true;
            numAddedState = i;
        };
    };

    const max = $dataStates[stateId].maxTurns;
    const min = $dataStates[stateId].minTurns;

    if (this.isAddedState(stateId) === true) {
        const lastingTurn = Math.random() * (max - min + 1) + min;
        this._state[numAddedState].leftTurn = Math.max(this._state[numAddedState].leftTurn, lastingTurn);
    } else {
        const stateData = $dataStates[stateId];
        stateData.leftTurn = Math.random() * (max - min + 1) + min;

        this._state.push(stateData);
    };
};


//ターンごとのステートに関する処理

//歩行でのターン経過を無効化
Game_Actor.prototype.stepsForTurn = function() {
    return 0;
};

//１つの
Game_BattleSystems.prototype.turnProcessOfState = function(battlerIndex) {
    const stateList = this.battlerList()[battlerIndex]._state;
    //ステート継続数を-1、0だったら解除
    for (let i = 1 ; i <= stateList.length - 1 ; i++) {
        stateList[i].leftTurn -= 1;
        if (stateList[i].leftTurn <= 0) {
            stateList.splice(i,1);
        };
    }
};

////追加能力値に関する処理////
////追加能力値に関する処理////

Game_BattleSystems.prototype.turnRefleshAll = function() {
    for (let i = 1; i <= this._enemyNum; i++) {
        this.turnAddStatusReflesh(i-1);
    };
};

Game_BattleSystems.prototype.spStateReflesh = function() {
    //HP満タン時に能力値増加のステート
};

Game_BattleSystems.prototype.turnAddStatusReflesh = function(battlerIndex) {
    this._battlerList[battlerIndex]._statusBuffs = {};

    ////////////////////////////
    ////通常能力値に関する特徴////
    ////////////////////////////

    //攻撃力倍率
    const atkObj = {code:21, _dataId:2};
    this._battlerList[battlerIndex]._statusBuffs.atkRate = this.getTurnRate(battlerIndex, atkObj);

    //防御倍率
    const defObj = {code:21, _dataId:3};
    this._battlerList[battlerIndex]._statusBuffs.defRate = this.getTurnRate(battlerIndex, defObj);

    //魔力倍率
    const matObj = {code:21, _dataId:4};
    this._battlerList[battlerIndex]._statusBuffs.defRate = this.getTurnRate(battlerIndex, matObj);

    //魔防倍率
    const mdfObj = {code:21, _dataId:5};
    this._battlerList[battlerIndex]._statusBuffs.mdfRate = this.getTurnRate(battlerIndex, mdfObj);

    //敏捷倍率
    const agiObj = {code:21, _dataId:6};
    this._battlerList[battlerIndex]._statusBuffs.agiRate = this.getTurnRate(battlerIndex, agiObj);

    /////////////////
    ////追加能力値////
    /////////////////

    //HP再生率
    const hpRgnObj = {code:22, _dataId:7};
    this._battlerList[battlerIndex]._statusBuffs.hpRgn = this.getTurnRate(battlerIndex, hpRgnObj);

    //MP再生率
    const mpRgnObj = {code:22, _dataId:8};
    this._battlerList[battlerIndex]._statusBuffs.mpRgn = this.getTurnRate(battlerIndex, mpRgnObj);

    //回避
    const evaObj = {code:22, _dataId:1};
    this._battlerList[battlerIndex]._statusBuffs.eva = this.getTurnRate(battlerIndex, evaObj);

    //魔法反射
    const reflectMagicObj = {code:22, _dataId:5};
    this._battlerList[battlerIndex]._statusBuffs.reflectMagic = this.getTurnRate(battlerIndex, reflectMagicObj);

    //反撃
    const countorObj = {code:22, _dataId:6};
    this._battlerList[battlerIndex]._statusBuffs.counter = this.getTurnRate(battlerIndex, countorObj);

    /////////////////
    ////特殊能力値////
    /////////////////

    //MP消費率
    const mpCostCutObj = {code:23, _dataId:4};
    this._battlerList[battlerIndex]._statusBuffs.mpCostCut = this.getTurnRate(battlerIndex, mpCostCutObj);

    /////////////////
    ////追加スキル////
    /////////////////

    //通常攻撃のHP吸収率
    this._battlerList[battlerIndex]._statusBuffs.hpDrainRate_passive = this.getTurnRate_Ori(battlerIndex, "hpDrainRate_passive");

    //通常攻撃のMP吸収率
    this._battlerList[battlerIndex]._statusBuffs.mpDrainRate_passive = this.getTurnRate_Ori(battlerIndex, "mpDrainRate_passive");

    //会心攻撃倍率
    this._battlerList[battlerIndex]._statusBuffs.critialAttackDamageRate = this.getTurnRate_Ori(battlerIndex, "critialAttackDamageRate");
};

//HP再生率とかの率を取得
Game_BattleSystems.prototype.getTurnRate = function(battlerIndex, traitObj) {
    let traitRate = 0;
    //装備
    const equipList = this.battlerList()[battlerIndex].equip();
    traitRate += this.traitsCalculate(battlerIndex, equipList, traitObj);

    //パッシブスキル
    const passiveSkillList = this.battlerList()[battlerIndex].skill();
    let PassiveStateList = [];
    for (let i = 1 ; i <= passiveSkillList.length - 1 ; i++) {
        if (passiveSkillList[i].meta.passiveState != undefined) {
            const stateData = $dataStates[evval(passiveSkillList[i].meta.passiveState)];
            PassiveStateList.push(stateData);
        };
    };
    traitRate += this.traitsCalculate(battlerIndex, PassiveStateList, traitObj);

    //ステート
    const stateList = this.battlerList()[battlerIndex]._state;
    traitRate += this.traitsCalculate(battlerIndex, stateList, traitObj);

    return traitRate;
};

//デフォルト実装の能力値の取得
Game_BattleSystems.prototype.traitsCalculate = function (battlerIndex, list, traitObj) {
    let result = 0;
    for (let i = 1 ; i <= list.length - 1 ; i++) {
        if (list[i] != undefined) {
            const traits = list[i-1].traits;
            if (traits.code === traitObj.code && traits._dataId === traitObj._dataId) {
                let value = 0
    
                //特性発動に条件がある場合
                const meta = list[i-1].meta;
                if (this.isTraitConditionOn(battlerIndex, meta)) {
                    //定数の場合
                    value = traits.value;
                    //変数の場合
                    const code = String(traitObj.code);
                    const traitValue = list[i-1].meta[code];
    
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
        const a = this.battlerList()[battlerIndex].status();
        eval(condition) ? result = true : result = false;
    };
    return result;
};

//オリジナルの能力値の率を取得
Game_BattleSystems.prototype.getTurnRate_Ori = function(battlerIndex, param) {
    let traitRate_Ori = 0;
    //装備
    const equipList = this.battlerList()[battlerIndex].equip();
    traitRate_Ori += this.traitsCalculate_Ori(battlerIndex, equipList, param);

    //パッシブスキル
    const passiveSkillList = this.battlerList()[battlerIndex].skill();
    let PassiveStateList = [];
    for (let i = 1 ; i <= passiveSkillList.length - 1 ; i++) {
        if (passiveSkillList[i].meta.passiveState != undefined) {
            const stateData = $dataStates[eval(passiveSkillList[i-1].meta.passiveState)];
            PassiveStateList.push(stateData);
        };
    };
    traitRate_Ori += this.traitsCalculate_Ori(battlerIndex, PassiveStateList, param);

    //ステート
    const stateList = this.battlerList()[battlerIndex].state;
    traitRate_Ori += this.traitsCalculate_Ori(battlerIndex, stateList, param);

    return traitRate_Ori;
};

//オリジナルの能力値の取得
Game_BattleSystems.prototype.traitsCalculate_Ori = function (battlerIndex, list, param) {
    let result = 0;
    for (let i = 1 ; i <= list.length - 1 ; i++) {
        if (list[i] != undefined) {
            const meta = list[i].meta;
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
    //battlerListで死亡扱いにする
    $gameBattleSystems.battlerList[eventId] = "dead"; 
    //消滅関連の共通処理
    this._enemyNum -= 1;
};

//ターゲット配列と発動回数をループ回数から算出
Game_BattleSystems.prototype.loop = function (loop, targetNum) {
    //(ループ回数 - 1) / 対象の数 + 1 発動回数　(ループ回数 - 1) / 対象の数　配列の順番
    const repeat = Math.floor(loop / targetNum);
    //(ループ回数 - 1) % 対象の数 + 1 対象の順番　(ループ回数 - 1) % 対象の数　配列の順番
    const targetIndex = Math.floor(loop % targetNum);
    this.loopResult = {_skillRepeat:repeat, _targetIndex:targetIndex};
    return {_skillRepeat:repeat, _targetIndex:targetIndex};
};

Game_BattleSystems.prototype._loopMax = function (param1, param2) {
    this._loopMax = param1 * param2;
    return param1 * param2;
};

})();

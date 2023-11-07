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
 * @param Dead_Performance
 * @text 死亡演出
 * @desc バトラー死亡時の演出に関する諸設定
 * @type struct<deadSettings>
 * 
 * @command ENCOUNT
 * @text エンカウント
 * @desc エンカウントに関するデータ上の処理
 * 
 * @arg troopId
 * @text ID
 * @desc 敵グループのID
 * @type string
 * 
 * @param animationTargetId
 * @text ID/名前
 * @desc アニメーション再生用のイベントのIDあるいは名前を入力
 * @type string
 * 
 */

/*~struct~deadSettings:ja
 * @param animationId
 * @text 死亡演出
 * @desc バトラー死亡時のアニメーションID
 * @type animation
 * @default 0
 * @
 * @param characterImage
 * @text 画像
 * @desc 死亡時のキャラクター画像
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
 * @param charaDirection
 * @text 向き
 * @desc キャラクターの向き
 * @type select
 * @
 * @option 下
 * @value 2
 * @
 * @option 左
 * @value 4
 * @
 * @option 右
 * @value 6
 * @
 * @option 上
 * @value 8
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

    const CRITICAL_RATE = 300

    const ANIMATION_TARGET = parameters['animationTargetId'];
    const DEAD_SETTING = JSON.parse(parameters['Dead_Performance']);
    console.log(DEAD_SETTING)

    let GTT_Battle = true;

    // //プラグインコマンド
    PluginManagerEx.registerCommand(script, 'ENCOUNT', (args) => {
        const troopId = eval(args.troopId);
        $gameBattleSystems.encount(troopId);
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
        $gameBattleSystems = contents.gameBattleSystems;
    };

    // ================================================================
    // 
    // Game_Mapの追加定義
    // 
    // ================================================================

    // 座標からプレイヤーがいるかも感知する
    // const _Game_Map_eventsXy = Game_Map.prototype.eventsXy;
    // Game_Map.prototype.eventsXy = function(x, y) {
    //     if (GTT_Battle) {
    //         if ($gamePlayer.x === x && $gamePlayer.y === y) {
    //             return -1;
    //         }
    //     }
    //     return _Game_Map_eventsXy.apply(this, arguments);
    // }

    // ================================================================
    // 
    // GTT_BattlerBase/Game_BattlerBaseの追加定義
    // 
    // ================================================================

    Object.defineProperties(Game_BattlerBase.prototype, {
        // Hit Points
        dex: {
            get: function() {
                return this._dex;
            },
            configurable: true
        }
    })

    const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
    Game_BattlerBase.prototype.initMembers = function() {
        _Game_BattlerBase_initMembers.apply(this);
        this._dex = 0;
        this._weaponProficiencyPlus = $dataSystem.weaponTypes.map(() => {return 0});
    }
    // ================================================================
    // 器用度
    // ================================================================
    Game_BattlerBase.prototype.addDex = function(value) {
        this._dex = Math.max(this._dex + value, 0);
    }
    // ================================================================
    // ある武器タイプIDの熟練度
    // ================================================================
    Game_BattlerBase.prototype.weaponProficiency = function(wtypeId) {
        const value =
            this.weaponProficiencyBasePlus(wtypeId) *
            this.weaponProficiencyRate(wtypeId) *
            this.weaponProficiencyBuffRate(wtypeId);
        return value;
    }
    Game_BattlerBase.prototype.weaponProficiencyBase = function(/*wtypeId*/) {
        return 0;
    }
    Game_BattlerBase.prototype.weaponProficiencyPlus = function(wtypeId) {
        return this._weaponProficiencyPlus[wtypeId];
    }
    Game_BattlerBase.prototype.weaponProficiencyBasePlus = function(wtypeId) {
        return Math.max(0, this.weaponProficiencyBase(wtypeId) + this.weaponProficiencyPlus(wtypeId));
    }
    // ================================================================
    // 味方か敵か
    // ================================================================
    Game_BattlerBase.prototype.role = function() {
        return this._role;
    }
    Game_BattlerBase.prototype.setRole = function(param) {
        this._role = param;
    }
    const _Game_BattlerBase_isActor = Game_BattlerBase.prototype.isActor;
    Game_BattlerBase.prototype.isActor = function() {
        if (this._role) {
            return this._role === "actor";
        }
        return _Game_BattlerBase_isActor.apply(this);
    }
    // ================================================================
    // 死亡状態
    // ================================================================
    Game_BattlerBase.prototype.isEliminated = function() {
        return this.isHidden() && this.isDeathStateAffected();
    }

    // ================================================================
    // 
    // GTT_Battler
    // 
    // ================================================================

    const _Game_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        _Game_Battler_initMembers.apply(this);
        this._spawnData = [0, 0];
        this._actNum = 0;
        this._actGauge = 0;
        this._actGaugeMax = 0;
        this._selectedWeaponId = 0;
        this._subjectBattlerId = 0;
        this._subjectCharacterId = 0;
        // このBattlerのキャラクターIDが1以上(つまり敵イベント)のとき、通常攻撃の対象はプレイヤー限定
        this._rockOnBattlerId = this._subjectCharacterId > 0 ? 0 : 1;
        this._rockOnCharacterId = 0;
        this._normalAttackSkillId = 1;
    }

    // ================================================================
    // 主体に関するデータ
    // ================================================================

    // バトラーインデックスを取得
    Game_Battler.prototype.subjectBattlerId = function() {
        return this._subjectBattlerId;
    }

    // バトラーインデックスを設定
    Game_Battler.prototype.setSubjectBattlerId = function(value) {
        this._subjectBattlerId = value;
    }

    // 主体キャラクターIDを出力する
    Game_Battler.prototype.subjectCharacterId = function() {
        return this._subjectCharacterId;
    }

    // 主体キャラクターデータを出力する
    Game_Battler.prototype.subjectCharacter = function() {
        if (this._subjectCharacterId > 0) {
            return $gameMap.event(this._subjectCharacterId);
        } else {
            return $gamePlayer;
        }
    }

    // 主体キャラクターIDを設定
    Game_Battler.prototype.setSubjectCharacterId = function(value) {
        this._subjectCharacterId = value;
    }

    // ================================================================
    // 通常攻撃の対象に関するデータ
    // ================================================================

    // 通常攻撃の対象のキャラクターIdを出力する
    Game_Battler.prototype.rockOnCharacterId = function() {
        return this._rockOnCharacterId;
    }

    // 通常攻撃の対象のキャラクターデータを出力する
    Game_Battler.prototype.rockOnCharacter = function() {
        if (this._rockOnCharacterId > 0) {
            return $gameMap.event(this._rockOnCharacterId);
        } else {
            return $gamePlayer;
        }
    }

    // 通常攻撃の対象の設定
    Game_Battler.prototype.setRockOnBattler = function(value) {
        this.setRockOnBattlerId(value);
        const charaId = $gameBattleSystems.battlers()[this._rockOnBattlerId].subjectCharacterId();
        this.setRockOnCharacterId(charaId);
    }

    // 通常攻撃の対象のバトラーインデックスを設定
    Game_Battler.prototype.setRockOnBattlerId = function(value) {
        this._rockOnBattlerId = value;
    }

    // 通常攻撃の対象のバトラーインデックスを設定
    Game_Battler.prototype.setRockOnCharacterId = function(value) {
        this._rockOnCharacterId = value;
    }

    // GTT_Battler.prototype.weaponProficiencyForItem = function(item) {
    //     const value = this.weaponProficiency(item.wtypeId);
    //     return value;
    // }

    // 使用中の武器Id
    Game_Battler.prototype.selectedWeaponId = function() {
        return this._selectedWeaponId;
    }

    // 使用中の武器Idを登録
    Game_Battler.prototype.setSelectedWeaponId = function(selectedWeaponId) {
        this._selectedWeaponId = selectedWeaponId;
    }

    // 使用中の武器データ
    Game_Battler.prototype.selectedWeaponData = function() {
        return $dataWeapons[this.selectedWeaponId()];
    }

    // ================================================================
    // ターン毎に行う上位処理
    // ================================================================

    // ターンごとに行動を決めて行動する上位処理
    Game_Battler.prototype.processTurn = function () {
        // 生きているバトラーのみ行動できる
        if (this.isAlive()) {
            // ターゲット
            if (this.isActor()) {this.refleshTarget();}
            // 行動ゲージ
            this.addActGauge();
            if (this.canAct()) {
                // まず対象の方を向く
                this.turnTowardRockOnCharacter();
                // 行動の内容を決める
                this.makeActions();
                // データ上で行動する
                this.processActions();
            }
            this.onAllActionsEnd();
        }
    }

    //行動ゲージ更新
    Game_Battler.prototype.addActGauge = function () {
        if (!this.isDead()) {
            this._actGauge += this.agi;
        }
    }

    // 行動するかどうか
    Game_Battler.prototype.canAct = function() {
        if (!this.isDead()) {
            return this._actGauge >= this._actNum * this._actGaugeMax;
        }
        return false;
    }

    // 行動の内容を決める
    const _Game_Battler_makeActions = Game_Battler.prototype.makeActions;
    Game_Battler.prototype.makeActions = function () {
        if (GTT_Battle) {
            this.clearActions();
            const actionTimes = 1;
            for (let i = 0; i < actionTimes; i++) {
                this.moveOrAttack(this._normalAttackSkillId);
                const action = new GTT_Action(this);
                this._actions.push(action);
            }
        } else {
            _Game_Battler_makeActions.apply(this);
        }
    }

    //移動か通常攻撃か
    Game_Battler.prototype.moveOrAttack = function(skillId) {
        const targetEnemyX = this.rockOnCharacter().x;
        const targetEnemyY = this.rockOnCharacter().y;
        const actorX = this.subjectCharacter().x;
        const actorY = this.subjectCharacter().y;

        const xDistance = Math.abs(actorX - targetEnemyX);
        const yDistance = Math.abs(actorY - targetEnemyY);
        const Distance = Math.max(xDistance, yDistance);
        
        const range = this.normalAttackRange(skillId);
        
        this._moveOrAttack = Distance <= range ? "attack" : "move";
    }

    Game_Battler.prototype.normalAttackRange = function(skillId) {
        if (skillId > 1) {
            return JSON.parse($dataSkills[skillId].meta.skillRange)[1];
        } else
        if (this.selectedWeaponData()) {
            return JSON.parse(this.selectedWeaponData().meta.skillRange);
        }
        return 1;
    }

    Game_Battler.prototype.processActions = function() {
        for (const action of this._actions) {
            action.processAction();
        }
    }

    // ================================================================
    // 移動に関する処理
    // ================================================================

    // 対象の方を向く
    Game_Battler.prototype.turnTowardRockOnCharacter = function() {
        this.subjectCharacter().turnTowardCharacter(this.rockOnCharacter());
    }

    // 対象の方へ行く
    Game_Battler.prototype.moveTowardRockOnCharacter = function() {
        this.subjectCharacter().moveTowardCharacter(this.rockOnCharacter());
    }

    // 回避する
    Game_Battler.prototype.evade = function(dx, dy, hitRate) {
        // 移動の処理
        const args = [];
        if (dx) {
            if (dx === -1) {
                args.push(4);
            } else 
            if (dx === 1) {
                args.push(6);
            }
        }
        if (dy) {
            if (dy === -1) {
                args.push(2);
            } else 
            if (dy === 1) {
                args.push(8);
            }
        }
        // 回避SE
        if (hitRate === 0) {
            SoundManager.playMiss();
        }
        SoundManager.playEvasion();
        // アクション
        this.subjectCharacter().evade(args);
    }

    Game_Battler.prototype.abilityList = function () {
        // 
    }

    // ================================================================
    // 描画に関する処理
    // ================================================================

    Game_Battler.prototype.performanceProcessData = function () {
        const dataList = this._actions.map((action) => {return action.performanceProcessData()});
        return dataList.flat();
    }

    // ================================================================
    // 
    // GTT_Actorの定義
    // 
    // ================================================================

    // class GTT_Actor extends Game_Actor {
    //     constructor(actorId) {
    //         super(actorId);
    //         this.setRole("actor");
    //     }
    //     //アビリティを取得して格納
    //     abilityList() {
    //         return this.skills().filter((v) => {return v && v.stypeId === ABILITY_SKILLTYPE});
    //     }
    //     // 通常攻撃の対象が死んでいたら変更する
    //     refleshTarget() {
    //         if (this._rockOnBattlerId) {
    //             if ($gameBattleSystems.battlers()[this._rockOnBattlerId].isDead()) {
    //                 this.autoReselectTarget();
    //             }
    //         } else {
    //             this.autoReselectTarget();
    //         }
    //     }
    //     // 通常攻撃の対象を生きている中で一番近い敵に自動で設定する
    //     autoReselectTarget() {
    //         const battlerIndex = $gameBattleSystems.aliveEnemies().reduce((total, current) => {
    //             const distance = Math.abs(current.subjectCharacter().x - this.subjectCharacter().x) + Math.abs(current.subjectCharacter().y - this.subjectCharacter().y);
    //             if (distance < total[0]) {
    //                 return [distance, current.subjectBattlerId()];
    //             } else {
    //                 return total;
    //             }
    //         }, [Infinity, 0]);
    //         this.setRockOnBattler(battlerIndex[1]);
    //     }
    //     // アクションの内容を決める
    //     makeActions() {
    //         Game_Battler.prototype.makeActions.call(this);
    //     }
    // }

    const _Game_Actor_initialize = Game_Actor.prototype.initialize;
    Game_Actor.prototype.initialize = function() {
        _Game_Actor_initialize.apply(this, arguments);
        this.setRole("actor");
    }

    //アビリティを取得して格納
    Game_Actor.prototype.abilityList = function() {
        return this.skills().filter((v) => {return v && v.stypeId === ABILITY_SKILLTYPE});
    }
    // 通常攻撃の対象が死んでいたら変更する
    Game_Actor.prototype.refleshTarget = function() {
        if (this._rockOnBattlerId) {
            if ($gameBattleSystems.battlers()[this._rockOnBattlerId].isEliminated()) {
                this.autoReselectTarget();
            }
        } else {
            this.autoReselectTarget();
        }
    }
    // 通常攻撃の対象を生きている中で一番近い敵に自動で設定する
    Game_Actor.prototype.autoReselectTarget = function() {
        const battlerIndex = $gameBattleSystems.aliveEnemies().reduce((total, current) => {
            const distance = Math.abs(current.subjectCharacter().x - this.subjectCharacter().x) + Math.abs(current.subjectCharacter().y - this.subjectCharacter().y);
            if (distance < total[0]) {
                return [distance, current.subjectBattlerId()];
            } else {
                return total;
            }
        }, [Infinity, 0]);
        this.setRockOnBattler(battlerIndex[1]);
    }
    // アクションの内容を決める
    Game_Actor.prototype.makeActions = function() {
        Game_Battler.prototype.makeActions.call(this);
    }
    // ================================================================
    // 
    // GTT_Enemyの定義
    // 
    // ================================================================
    const _Game_Enemy_initialize = Game_Enemy.prototype.initialize;
    Game_Enemy.prototype.initialize = function() {
        _Game_Enemy_initialize.apply(this, arguments);
        this.initBattler();
    }

    Game_Enemy.prototype.initBattler = function() {
        this.setRole("enemy");
        this.setRockOnBattlerId(0);
        this.setRockOnCharacterId(-1);
    }

    Game_Enemy.prototype.abilityList = function() {
        const skillList = this.enemy().actions.map((v) => {return $dataSkills[v.skillId]});
        return skillList.filter((v) => {return v && v.stypeId === ABILITY_SKILLTYPE});
    }

    // class GTT_Enemy extends Game_Enemy {
    //     constructor(enemyId) {
    //         super(enemyId, 0, 0);
    //         this.setRole("enemy");
    //         this.setRockOnBattlerId(0);
    //         this.setRockOnCharacterId(-1);
    //     }
    //     //アビリティを取得して格納
    //     abilityList() {
    //         const skillList = this.enemy().actions.map((v) => {return $dataSkills[v.skillId]});
    //         return skillList.filter((v) => {return v && v.stypeId === ABILITY_SKILLTYPE});
    //     }
    // }

    // ================================================================
    // 
    // GTT_Actionの定義
    // 
    // ================================================================

    // 行動の内容を決める
    // 行動内容の効果が発動する場所を決める
    // 行動内容が発動するか決める
    // 発動した行動内容の効果を適用する

    class GTT_Action extends Game_Action {
        constructor(battler) {
            super(battler);
            this._actionType = "";
            this._range = 0;
            this._skillId = 0;
            this._itemScope = new GTT_ItemScope();
            this._itemPerformance = new GTT_ActionPerformance();
            this._weapon = new Game_Item();
            this.initAction();
        }
        // ================================================================
        // 初期のデータ設定
        // ================================================================
        initAction() {
            // 武器の登録
            this._weapon.setObject(this.subject().selectedWeaponData());
            // 攻撃か移動か
            this.setActionType(this.subject()._moveOrAttack);
            // 攻撃なら攻撃データを設定
            this.setupAction();
        }
        // ================================================================
        // データ
        // ================================================================
        // 主体に関する処理
        subject() {
            return $gameBattleSystems.battlers()[this._subjectBattlerId];
        }
        setSubject(battler) {
            this._subjectBattlerId = battler.subjectBattlerId();
        }
        // 攻撃タイプを設定
        setActionType(param) {
            this._actionType = param;
        }
        // 行動タイプが攻撃なら攻撃データを整える
        setupAction() {
            if (this.isAttack()) {
                this.decideAttackSkill();
                this.setSkill();
                // 攻撃対象の設定
                this._itemScope.setup(this);
            }
        }
        // 移動か
        isMove() {
            return this._actionType === "move";
        }
        // 攻撃か
        isAttack() {
            return this._actionType === "attack";
        }
        // 攻撃スキルを決定し、プロパティに設定
        decideAttackSkill() {
            //戦技値と武器熟練度を取得
            const skillId = this.getAbilityId();
            const proficiency = this.weaponProficiencyForItem(skillId);
            //目標値と乱数を生成
            const goal = skillId > 1 ? (this.subject().dex + proficiency) / 2 : 0;
            const random = Math.floor(Math.random() * 100 + 1);
            //判定成功時のスキルデータ、スキルor武器メタデータを格納
            this._skillId = goal >= random ? this.getAbilityId() : 1;
        }
        // アビリティを決めて出力する
        getAbilityId() {
            const abilityList = this.subject().abilityList();
            //アビリティが複数の場合、ランダムでその一つになる
            if (abilityList.length) {
                return abilityList[Math.floor(Math.random() * abilityList.length)].id;
            } else {
                return 1;
            }
        }
        // あるスキル/アイテムに対する武器熟練度の取得
        weaponProficiencyForItem(id) {
            const meta = $dataSkills[id].meta;
            const demandedWeaponType = meta ? JSON.parse(meta["weaponType"]) : []; // スキルが要求する武器練度のタイプ一覧
            const weapon = this._weapon.object();
            const weaponTypeId = weapon ? weapon.wtypeId : 0; // 今装備している武器タイプ
            // 今装備している武器タイプがスキルが要求する武器練度のタイプに含まれている場合、今装備している武器の練度を出力する
            return demandedWeaponType.includes(weaponTypeId) ? this.subject().weaponProficiency(weaponTypeId) : 0;
        }
        // スキルの設定
        setSkill() {
            this._item.setObject($dataSkills[this._skillId]);
        }
        scopeType() {
            return this.rangeData()[0];
        }
        range() {
            return this.rangeData()[1];
        }
        effectiveRange() {
            return this.rangeData()[2];
        }
        rangeData() {
            const range = this._skillId > 1 ? this._item.objectMeta("range") : this._weapon.objectMeta("range");
            return range ? range : ["target", 1, 0];
        }
        proficiencyData() {
            const demandedWeaponType = this._item.objectMeta("weaponType");
            return demandedWeaponType ? demandedWeaponType : [];
        }
        // ================================================================
        // Actionの上位処理
        // ================================================================
        processAction() {
            if (this.isAttack()) {
                this.processAttack();
            } else 
            if (this.isMove()) {
                this.processMove();
            }
        }
        // ================================================================
        // 移動の処理
        // ================================================================
        processMove() {
            const id = this.subject().subjectBattlerId();
            this._itemPerformance.addMoveData(id);
        }
        // ================================================================
        // 攻撃の上位処理
        // ================================================================

        // 攻撃を行う場所を収集
        // 一つの攻撃行動に対し、範囲内の敵を収集　→　収集した敵毎にダメージ等計算　→　[敵の座標、アニメーションID、ダメージ量]を１つの行動の描画処理用データリストに追加
        processAttack() {
            // 対象のリスト
            const entries = this._itemScope.itemTargetEntries();
            // 数値上の処理
            // 発動回数によるループ
            for (let repeat = 0; repeat < this._item.object().repeats; repeat++) {
                // アニメーション再生のためのデータ用意
                this._itemPerformance.addAnimationData([entries.map((entry) => {return [...entry[0]]}), this._item.object().animationId]);
                // 効果発動箇所によるループ
                for (let i = 0; i < entries.length; i++) {
                    // 対象への効果適用
                    const targets = entries[i][1];
                    const damagePopups = [];
                    const evasions = [];
                    // 対象によるループ
                    for (let j = 0; j < targets.length; j++) {
                        // データ上の処理
                        const target = $gameBattleSystems.battler(targets[j]);
                        this.apply(target);
                        // ダメージポップアップのためのデータ用意
                        if (this._itemHitRate > 0) { // {type: , reverse: , critical: }
                            const setting = {type: this.damageType(), reverse: false, critical: false};
                            if (this._itemHitRate === CRITICAL_RATE) {setting.critical = true};
                            damagePopups.push([target.subjectBattlerId(), this._damageValue, setting]);
                        } else {
                            damagePopups.push([target.subjectBattlerId(), 0, {type: "MISS", reverse: false, critical: false}]);
                        }
                        // 回避行動のためのデータ用意
                        if(this._itemHitRate < 100) {
                            evasions.push([target.subjectBattlerId(), ...this._evasionDestination, this._itemHitRate])
                        }
                    }
                    this._itemPerformance.addDamagePopupData(damagePopups);
                    this._itemPerformance.addEvasionData(evasions);
                }
            }
        }
        // 効果適用処理
        apply(target) {
            // 命中判定
            this._itemHitRate = this.itemHitRate(target);
            if (this._itemHitRate > 0) {
                // ダメージ判定
                if (this.item().damage.type > 0) {
                    this._damageValue = this.makeDamageValue(target, this._itemHitRate);
                    this.executeDamage(target, this._damageValue);
                }
                // 追加効果判定
                for (const effect of this.item().effects) {
                    this.applyItemEffect(target, effect);
                }
            }
            if (this._itemHitRate < 100){
                this._evasionDestination = this.evadeDestination(target);
            }
        }
        // ダメージの対象が何か
        damageType() {
            if(this.isHpEffect()) {
                return "HP";
            } else 
            if(this.isMpEffect()) {
                return "MP";
            }
        }
        // ================================================================
        // 命中判定関係
        // ================================================================
        //命中判定
        itemHitRate(target) {
            const goal = this.itemHitGoal(target);
            const random = Math.random() * 100;
            if (random < goal / 4) {
                return CRITICAL_RATE;
            } else
            if (random < goal / 2) {
                return 100;
            } else
            if (random < goal) {
                return 50;
            }
            return 0;
        }
        //命中判定目標
        itemHitGoal(target) {
            const item = this.item();
            const a = this.subject();
            const b = target;
            
            const hit = a.dex + a.agi + item.successRate + this.weaponProficiencyForItem(this._skillId);
            const eva = b.dex + b.agi;
            return hit - eva;
        }
        // ================================================================
        // ダメージ計算
        // ================================================================
        // Game_Actionのダメージ計算結果に、命中レベルによるダメージ補正をかける
        makeDamageValue(target, itemHitRate) {
            const damage = Game_Action.prototype.makeDamageValue.call(this, target);
            return Math.floor(damage * itemHitRate / 100);
        }
        // ================================================================
        // 相手の回避演出に関する処理のデータ
        // ================================================================
        //回避先座標決定
        evadeDestination(target) {
            const evaCharaX = target.subjectCharacter().x;
            const evaCharaY = target.subjectCharacter().y;
    
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
                if ($gameBattleSystems.battlerIdXy(towardX, towardY) >= 0) {continue};
                if (moveX === 0 && moveY === 0) {continue};
                if (towardX < MIN_X || towardX > MAX_X) {continue};
                if (towardY < MIN_Y || towardY > MAX_Y) {continue};
        
            if (condition === 0) {movable = true};
            };
    
            return [moveX, moveY];
        }
        // 演出データ
        performanceProcessData() {
            return this._itemPerformance.data();
        }
    }

    const _Game_ActionResult_clear = Game_ActionResult.prototype.clear;
    Game_ActionResult.prototype.clear = function() {
        _Game_ActionResult_clear.apply(this, arguments);
        this.itemHitRate = 100;
    }

    const _Game_ActionResult_isHit = Game_ActionResult.prototype.isHit;
    Game_ActionResult.prototype.isHit = function() {
        if (this.itemHitRate) {
            return this.itemHitRate > 0;
        }
        return _Game_ActionResult_isHit.apply(this);
    }

    // ================================================================
    // 
    // GTT_ItemScope 
    // ---効果が発動する箇所とそれぞれの効果を受けるバトラーをまとめるクラス
    // ================================================================

    class GTT_ItemScope {
        constructor() {
            this._subjectBattlerId = -1;
            this._scopeType = "";
            this._range = 0;
            this._effectiveRange = 0;
            this._itemTargetTileList = [];
            this._itemTargetBattlersIdList = [];
            this._itemTargetEntries = [];
        }
        // ================================================================
        // データ
        // ================================================================
        // 主体のデータ
        subject() {
            return $gameBattleSystems.battlers()[this._subjectBattlerId];
        }
        // 効果発動マスとその発動した効果の対象のバトラーリストの組のリスト
        itemTargetEntries() {
            return this._itemTargetEntries;
        }
        // アイテムの効果が発動するマス
        itemTargetTileList() {
            return this._itemTargetTileList; // [[x, y], [x, y], ...]
        }
        // アイテムの効果発動の対象のバトラーインデックス
        itemTargetBattlersIdList() {
            return this._itemTargetBattlersIdList;
        }
        // アイテムの効果発動の対象のバトラー
        itemTargetBattlers() {
            return this._itemTargetBattlersIdList.map((index) => {
                return $gameBattleSystems.battlers()[index];
            })
        }
        // ================================================================
        // データ設定
        // ================================================================
        setup(action) {
            this._subjectBattlerId = action._subjectBattlerId;
            this._scopeType = action.scopeType();
            this._range = action.range();
            this._effectiveRange = action.effectiveRange();
            this.createItemTargetTileList();
            this.createItemTargetEntries();
        }
        // ================================================================
        // アイテムの効果が発動するマス収集
        // ================================================================
        // アイテムの効果が発動するマスのリストを作成
        createItemTargetTileList() {
            const scopeType = this._scopeType;
            const range = this._range;
            const effectiveRange = this._effectiveRange;
            let list
            switch(scopeType) {
                case "direction":
                    list = [this.typeDirectionTargetTileXy(range, effectiveRange)];
                    break;
                case "area":
                    list = [this.subject().subjectCharacter().x, this.subject().subjectCharacter().y];
                    break;
                case "areaEach":
                    list = this.typeAreaEachTargetTileXy(range, effectiveRange);
                    break;
                case "point":
                    list = [[TouchInput.x, TouchInput.y]];
                    break;
                case "target":
                    list = [[this.subject().rockOnCharacter().x, this.subject().rockOnCharacter().y]];
                    break;
                case "self":
                    list = [[this.subject().subjectCharacter().x, this.subject().subjectCharacter().y]];
                    break;
                default:
                    list = [[0,0]];
                    break;
            }
            this._itemTargetTileList = list;
        }
        // directionタイプのアクションの効果発動マスの座標を出力
        typeDirectionTargetTileXy(range) {
            const subjectCharaDirect = this.subject().subjectCharacter()._direction;
            let targetX = this.subject().subjectCharacter().x;
            let targetY = this.subject().subjectCharacter().y;
            const distance = Math.max((range - 1) / 2, 1);
            switch(subjectCharaDirect) {
                case 2:
                    targetY = Math.min(targetY + distance, MAX_Y);
                    break;
                case 4:
                    targetX = Math.max(targetX - distance, MIN_X);
                    break;
                case 6:
                    targetX = Math.min(targetX + distance, MAX_X);
                    break;
                case 8:
                    targetY = Math.max(targetY - distance, MIN_Y);
                    break;
                default:
                    break;
            }
            return [targetX, targetY];
        }
        // areaEachタイプの攻撃のアクションの効果発動マスの座標を出力
        typeAreaEachTargetTileXy(range, effectiveRange) {
            // 範囲内の敵の座標を集める
            const targetXyList = [];
            const baseX = (this.subject().subjectCharacter().x - range).clamp(MIN_X, MAX_X);
            const baseY = (this.subject().subjectCharacter().y - range).clamp(MIN_Y, MAX_Y);
            for (let dx = 0; baseX + dx < Math.min(baseX + range * 2 + 1, MAX_X + 1); dx++) {
                for (let dy = 0; baseY + dy < Math.min(baseY + range * 2 + 1, MAX_Y + 1); dy++) {
                    const x = baseX + dx;
                    const y = baseY + dy;
                    if (Math.abs(x - this.subject().subjectCharacter().x) + Math.abs(y - this.subject().subjectCharacter().y) > range + effectiveRange) {continue};
                    if ($gameBattleSystems.battlerXy(x, y)) {
                        // console.log([$gameBattleSystems.battlerXy(x, y).role(), this.subject().role()])
                        if ( $gameBattleSystems.battlerXy(x, y).role() != this.subject().role()) {
                        //ID収集
                        targetXyList.push([x, y]);
                        }
                    };
                };
            };
            return targetXyList;
        }
        // ================================================================
        // 効果範囲内の敵Id収集
        // ================================================================
        // アイテムの効果が発動するマスのリストを元に、対象バトラーを集める処理
        createItemTargetEntries() {
            this._itemTargetEntries = this._itemTargetTileList.map((tile) => {
                const rect = this.createItemScopeRect(...tile);
                const targets = this.inScopeBattlers(...rect);
                return [tile, targets];
            })
        }
        // あるマスで発動する効果の範囲の四角形情報を生成
        createItemScopeRect(x, y) {
            if (this._scopeType === "direction") {
                return this.typeDirectionRect(x, y);
            } else 
            {
                const effectiveRange = this._effectiveRange;
                return [x - effectiveRange, y - effectiveRange, effectiveRange, effectiveRange];
            }
        }
        typeDirectionRect(x, y) {
            const charaDirect = this.subject().subjectCharacter()._direction;
            let baseX, baseY, width, height;
            const range = Math.floor(this._range / 2);
            switch(charaDirect) {
                case 2: 
                    baseX = x - this._effectiveRange;
                    baseY = y - range;
                    width = this._effectiveRange;
                    height = this._range;
                    break;
                case 4:
                    baseX = x - range;
                    baseY = y - this._effectiveRange;
                    width = this._range;
                    height = this._effectiveRange;
                    break;
                case 6:
                    baseX = x + range;
                    baseY = y - this._effectiveRange;
                    width = this._range;
                    height = this._effectiveRange;
                    break;
                case 8:
                    baseX = x - this._effectiveRange;
                    baseY = y + range;
                    width = this._effectiveRange;
                    height = this._range;
                    break;
                default:
                    break;
            }
            return [baseX, baseY, width, height];
        }
        // あるマスで発動する効果の対象のバトラーのリストを出力
        inScopeBattlers(baseX, baseY, width, height) {
            const list = [];
            for (let dx = 0; dx < width * 2 + 1; dx++) {
                for (let dy = 0; dy < height * 2 + 1; dy++) {
                    const battlerId = $gameBattleSystems.battlerIdXy(baseX + dx, baseY + dy);
                    if (battlerId >= 0 && this.subject().role() != $gameBattleSystems.battler(battlerId).role()) {
                        list.push(battlerId);
                    }
                }
            }
            return list;
        }
    }


    // ================================================================
    // 
    // GTT_ActionPerformance
    // 
    // ================================================================

    class GTT_ActionPerformance {
        constructor() {
            this._data = [];
        }
        data() {
            return this._data;
        }
        // {type: , battlerId: }
        // {type: , x: , y: , animationId: , targets: [{id: , damage: }]}
        // {type: , battlerId: , x: , y: }
        addMoveData(id) {
            this._data.push({type: "move", battlerId: id})
        }
        addAnimationData(animations) { // animations = [[[x, y]], animationId]
            this._data.push({type: "animation", animations: animations})
        }
        addDamagePopupData(damagePopups) { // damagePopsups = [battlerId, damageValue, {type: , reverse: , critical: }]
            this._data.push({type: "damage", popup: damagePopups});
        }
        addEvasionData(evasions) { // evasions = [battlerId, x, y, hitRate]
            this._data.push({type: "evade", evasions: evasions});
        }
    }

    // ================================================================
    // ポップアップ演出用のデータ
    // ================================================================

    // ================================================================
    // 
    // Game_Itemの追加定義
    // 
    // ================================================================

    Game_Item.prototype.objectMeta = function(param) {
        if (this.isSkill() && this._itemId === 1) {
            return null;
        } else {
            // 上の場合以外は、このデータのメタを参照
            if (this.object()) {
                return this.object().meta ? JSON.parse(this.object().meta[param]) : null;
            } else {
                return null;
            }
        }
    }

    // ================================================================
    // 
    // Game_BattleSystemsの追加定義
    // 
    // ================================================================

    class Game_BattleSystems {
        constructor() {
            this._battlers = [];
            this._method = {};
            this.clearLoop();
        }
        // ================================================================
        // データ
        // ================================================================
        // ================================================================
        // 真偽値保存
        // ================================================================
        boolean(param) {
            return this._boolean[param];
        }
        clearBoolean(key) {
            this._boolean[key] = null;
        }
        setBoolean(key, value) {
            this._boolean[key] = value;
        }
        // ================================================================
        // ループ管理オブジェクト関係
        // ================================================================
        clearLoop() {
            this._loop = {};
            this._lastLoop = {};
        }
        loopValue(param) {
            this.setupLoop(param);
            return this._loop[param] - 1;
        }
        loopInitialize(param) {
            this._loop[param] = 0
            this._lastLoop[param] = false;
        }
        setupLoop(param) {
            if (this._loop[param] === undefined) {
                this._loop[param] = 0;
                this._lastLoop[param] = false;
            }
        }
        loopBreak(param1, param2) {
            this.setupLoop(param1);
            this._loop[param1]++;
            if (this._loop[param1] > param2) {
                this.loopInitialize(param1);
                return true;
            }
            if (this._loop[param1] === param2) {
                this._lastLoop[param1] = true;
            }
            return false;
        }
        isLastLoop(param) {
            return this._lastLoop[param];
        }
        // ================================================================
        // プロパティ
        // ================================================================
        battlers() {
            return this._battlers;
        }
        battler(value) {
            return this._battlers[value];
        }
        enemies() {
            return this._battlers.slice(1, this._battlers.length);
        }
        actGaugeMax() {
            this._actGaugeMax;
        }
        battlersNum() {
            return this._battlers.length;
        }
        battlerIdXy(x, y) {
            return this._battlers.findIndex((battler) => {
                return battler.subjectCharacter().x === x && battler.subjectCharacter().y === y && battler.isAlive();
            });
        }
        battlerXy(x, y) {
            return this._battlers.find((battler) => {
                return battler.subjectCharacter().x === x && battler.subjectCharacter().y === y && battler.isAlive();
            });
        }
        // ================================================================
        // エンカウント
        // ================================================================
        encount(troopId) {
            // エンカウントする敵を設定
            this.setTroopId(troopId);
            // battlerデータを整える
            this.createBattlers(this._encountTroopGropeId);
            // スポーン位置を決定
            this.createPlayerSpawn();
            this.createEnemySpawnData();
        }
        // エンカウントする敵を設定
        setTroopId(value) {
            this._encountTroopGropeId = value;
        }
        // 戦闘者リストを作る
        createBattlers(troopId) {
            const enemies = $dataTroops[troopId].members.map((troop) => {return new Game_Enemy(troop.enemyId, 0, 0)});
            for (const enemy of enemies) {
                enemy._hp = enemy.mhp;
            }
            this._battlers = [$gameActors.actor(1), ...enemies];
            // キャラクターIDとバトラーIDの設定
            this.battlers()[0].setSubjectCharacterId(-1);
            for (let i = 0; i < this.battlers().length; i++) {
                // バトラーIDの設定
                this.battlers()[i].setSubjectBattlerId(i);
                // 通常攻撃対象の設定
                const targetCharacterId = this.battlers()[i]._subjectBattlerId > 0 ? -1 : 1;
                this.battlers()[i].setRockOnCharacterId(targetCharacterId);
                // 見えていることにする
                this.battlers()[i].appear();
            }
        }
        // プレイヤースポーン位置設定
        createPlayerSpawn() {
            const x = Math.floor(Math.random() * (MAX_X - MIN_X + 1)) + MIN_X;
            const y = Math.floor(Math.random() * (MAX_Y - MIN_Y + 1)) + MIN_Y;
            this._battlers[0]._spawnData = [x, y];
        }
        // 敵スポーン位置設定
        createEnemySpawnData() {
            const centerX = ((MIN_X + MAX_X) / 2);
            const centerY = ((MIN_Y + MAX_Y) / 2);
            const signX = - Math.sign(this._battlers[0]._spawnData[0] - centerX);
            const signY = - Math.sign(this._battlers[0]._spawnData[1] - centerY);
            for (let i = 1; i < this._battlers.length; i++) {
                while (true) {
                    const enemySetX = centerX + signX * Math.floor(Math.random() * ((centerX - 1) / 2 + 1) + 1);
                    const enemySetY = centerY + signY * Math.floor(Math.random() * ((centerY - 1) / 2 + 1) + 1);
                    if (this.canSpawn(enemySetX, enemySetY)) {
                        this._battlers[i]._spawnData = [enemySetX, enemySetY];
                        break;
                    }
                };
            };
        }
        // その位置がスポーン可能か
        canSpawn(x, y) {
            return this.battlerIdXy(x, y) < 0;
        }
        // hpを設定
        setBattlersHp(battlerIndex, value) {
            this._battlers[battlerIndex].hp = value;
        }
        // 生きている敵
        aliveEnemies() {
            return this._battlers.filter((battler) => {
                return battler.role() === "enemy" && battler.isAlive();
            })
        }
        // 生きている敵の数
        aliveEnemiesNum() {
            return this.aliveEnemies().length;
        }
        // 生きている敵のキャラクターIDとhpの組のリスト
        aliveEnemiesHp() {
            return this.aliveEnemies().map((enemy) => {
                return [enemy.subjectCharacterId(), enemy._hp];
            })
        }
        // ================================================================
        // 戦闘システム
        // ================================================================
        processTurn() {
            // プライヤーの通常攻撃の標的アップデート
            this.battlers()[0].refleshTarget();
            // バトラーの行動
            for (const battler of this.battlers()) {
                battler.processTurn();
            }
            // ターンごとの処理
            for (const battler of this.battlers()) {
                battler.onTurnEnd();
            }
            // 演出用のデータ生成
            this.makePerformances();
        }
        // ================================================================
        // 描画データ
        // ================================================================
        makePerformances() {
            this._performances = this.battlers().map((battler) => {
                return battler._actions.map((action) => {
                    return action._itemPerformance.data();
                })
            }).flat(2);
        }
        performances() {
            return this._performances;
        }
        performance(value) {
            return this._performances[value];
        }
        performancesNum() {
            return this._performances.length;
        }
        // ================================================================
        // 描画処理
        // ================================================================
        actionMove(param) {
            const data = this.performance(this.loopValue(param));
            if (this.isMove(data.type)) {
                this.battlers()[data.battlerId].moveTowardRockOnCharacter();
            }
        }
        // 攻撃か 使用できるアニメ再生用イベントがあるか
        isAnimationTargetExist(param) {
            const data = this.performance(this.loopValue(param));
            console.log(data)
            if (this.isAnimation(data.type)) {
                return $gameMap.isNeedAnimationTarget();
            }
        }
        // アニメーション再生
        actionPlayAttackAnimation(param) {
            const data = this.performance(this.loopValue(param));
            if (this.isAnimation(data.type)) {
                const id = $gameMap.usableAnimationTargetId();
                const character = $gameMap.event(id);
                const animation = data.animations;
                character.locate(animation[0], animation[1]);
                $gameTemp.requestAnimation([character], animation[2]);
            }
        }
        // ゲージ更新用のデータを取得
        gaugeUpdateData(param) {
            const data = this.performance(this.loopValue(param));
            if (this.isDamage(data.type)) {
                return data.popup;
            }
            return [[0, 0]];
        }
        // ポップアップ用のデータを取得
        // バトラーごとにダメージ結果リストを用意してダメージを受けるたびに値を追加していく
        damagePopupData(param) {
            const data = this.performance(this.loopValue(param));
            if (this.isDamage(data.type)) {
                return data.popup.map((v) => {
                    return {
                        characterId: this.battler(v[0]).subjectCharacterId(),
                        value: v[1],
                        type: v[2].type,
                        critical: v[2].critical,
                        reverse: v[2].reverse,
                    }
                })
            }
            return ;
        }
        // 回避行動
        actionEvade(param) {
            const data = this.performance(this.loopValue(param));
            if (this.isEvade(data.type)) {
                for (const evasion of data.evasions)
                this.battlers()[evasion[0]].evade(evasion[1], evasion[2], evasion[3]);
            }
        }
        // メソッド登録を利用した処理
        allPerformance(param) {
            const data = this.performance(this.loopValue(param));
            // 移動
            if (this.isMove(data.type)) {
                this.battlers()[data.battlerId].moveTowardRockOnCharacter();
            }
            // アニメーション再生
            this.playAnimations(param);
            // ポップアップ
            if (this.isDamage(data.type)) {
                const popups = data.popup.map((v) => {
                    return {
                        battlerId: v[0],
                        value: v[1],
                        type: v[2].type,
                        critical: v[2].critical,
                        reverse: v[2].reverse,
                    }
                });
                for (const popup of popups) {
                    const characterId = this.battler(popup.battlerId).subjectCharacterId();
                    this._method["popup"](characterId, popup.type, popup.value, popup.critical);
                    if (popup.critical) {
                        this.battler(popup.battlerId).subjectCharacter().jump(0, 0, 2);
                    }
                }
            }
            // ゲージ更新
            this._method["updateGauge"](this.aliveEnemiesHp());
        }
        setAnimation(param) {
            const data = this.performance(this.loopValue(param));
            if  (this.isAnimation(data.type)) {
                const needTargetNum = $gameMap.needAdditionalTargetNum(data.animations[0].length);
                for (let i = 0; i < needTargetNum; i++) {
                    // アニメーション再生のためのイベントを設置
                    const id = this._method["getRespawnEventId"](ANIMATION_TARGET, true);
                    this._method["eventRespawn"](id, 0, 0, true);
                    $gameMap.event($gameMap._lastSpawnEventId).setAnimationTarget(true);
                }
            }
        }
        playAnimations(param) {
            const data = this.performance(this.loopValue(param));
            if  (this.isAnimation(data.type)) {
                for (let i = 0; i < data.animations[0].length; i++) {
                    // アニメーション再生
                    const id = $gameMap.usableAnimationTargetId();
                    const character = $gameMap.event(id);
                    const animation = data.animations[0][i];
                    character.locate(animation[0], animation[1]);
                    $gameTemp.requestAnimation([character], data.animations[1]);
                    if (this.isLastLoop(param) && i === data.animations[0].length - 1) {
                        this._method["setWaitMode"]("animation");
                    }
                }
            }
        }
        // ================================================================
        // 行動が何か判定
        // ================================================================
        isMove(param) {
            return param === "move";
        }
        isAnimation(param) {
            return param === "animation";
        }
        isDamage(param) {
            return param === "damage";
        }
        isEvade(param) {
            return param === "evade";
        }
        // ================================================================
        // 死亡処理
        // ================================================================
        isBattlerDead(param) {
            const battler = this.battlers()[this.loopValue(param)];
            return battler.isDead();
        }
        deadPerformance(param) {
            const index = this.loopValue(param);
            const animationId = Number(DEAD_SETTING.animationId);
            const charaImage = DEAD_SETTING.characterImage;
            const charaIndex = Number(DEAD_SETTING.charaImgIndex);
            const charaDirection = Number(DEAD_SETTING.charaDirection)
            // 爆発
            const character = this.battlers()[index].subjectCharacter();
            $gameTemp.requestAnimation([character], animationId);
            // 見えないことにする
            this.battlers()[index].hide();
            character.setImage(charaImage, charaIndex);
            character.setPriorityType(0);
            character.setDirection(charaDirection);
        }
        // ================================================================
        // メソッドの登録
        // ================================================================
        setPluginsMethod(key, method) {
            this._method[key] = method;
        }
        // スポーンするイベントのIDを取得する処理
        setRespawnIdMethod(method) {
            this.setPluginsMethod("getRespawnEventId", method);
        }
        // イベントをスポーンさせる処理
        setRespawnMethod(method) {
            this.setPluginsMethod("eventRespawn", method);
        }
        // アニメーションウェイトの処理
        setWaitModeMethod(method) {
            this.setPluginsMethod("setWaitMode", method);
        }
        // ポップアップに関するメソッド
        setPopupMethod(method) {
            this.setPluginsMethod("popup", method);
        }
        // ゲージ更新に関するメソッド
        setUpdateGaugeMethod(method) {
            this.setPluginsMethod("updateGauge", method);
        }
    }

    // ================================================================
    // 使用できるアニメ再生用イベントを検索
    // ================================================================

    // 攻撃か 使用できるアニメ再生用イベントが存在しないか
    Game_Map.prototype.isNeedAnimationTarget = function() {
        // return !this.isAnimationTargetExist();
    }

    // 攻撃か 使用できるアニメ再生用イベントがあるか
    Game_Map.prototype.isAnimationTargetExist = function() {
        return this.events().some((event) => {return event.isAnimationTarget() && !event.isAnimationPlaying()});
    }

    Game_Map.prototype.needAdditionalTargetNum = function(value) {
        const needNum = value - this.events().filter((event) => {return event.isAnimationTarget() && !event.isAnimationPlaying()}).length;
        return Math.max(needNum, 0);
    }

    // 攻撃か 使用できるアニメ再生用イベントのインデックスを取得
    Game_Map.prototype.usableAnimationTargetId = function() {
        const index = this.events().findIndex((event) => {return event.isAnimationTarget() && !event.isAnimationPlaying()});
        return index + 1;
    }

    // ================================================================
    // Game_CharacterBaseの追加定義
    // ================================================================
    const _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _Game_CharacterBase_initMembers.apply(this);
        this._jumPeakRate = 1;
    }

    const _Game_CharacterBase_endAnimation = Game_CharacterBase.prototype.endAnimation;
    Game_CharacterBase.prototype.endAnimation = function() {
        _Game_CharacterBase_endAnimation.apply(this);
        if (this.isAnimationTarget()) {
            // 初期位置にリセット
            this.locate(0, 0);
        }
    }

    // アニメ再生用イベントかどうか
    Game_CharacterBase.prototype.isAnimationTarget = function() {
        return this._animationTarget;
    }

    // アニメ再生用イベントかどうか設定
    Game_CharacterBase.prototype.setAnimationTarget = function(value) {
        this._animationTarget = value;
    }

    // 回避アクション
    Game_CharacterBase.prototype.evade = function(args) {
        // 歩行アニメ停止 + 向き固定
        this.setWalkAnime(false);
        this.setDirectionFix(true);
        // 移動の処理
        if (args.length === 1) {
            this.moveStraight(...args);
        } else 
        if (args.length === 2) {
            this.moveDiagonally(...args);
        }
        // 歩行アニメ再開 + 向き固定解除
        this.setWalkAnime(true);
        this.setDirectionFix(false);
    }

    // ノックバック
    Game_CharacterBase.prototype.knockback = function(args) {
        // 向き固定
        this.setDirectionFix(true);
        // 移動の処理
        if (args.length === 1) {
            this.moveStraight(...args);
        } else 
        if (args.length === 2) {
            this.moveDiagonally(...args);
        }
        // 向き固定解除
        this.setDirectionFix(false);
    }

    // ジャンプに高さ倍率の設定項目を追加
    Game_CharacterBase.prototype.jump = function(xPlus, yPlus, heightRate) {
        if (Math.abs(xPlus) > Math.abs(yPlus)) {
            if (xPlus !== 0) {
                this.setDirection(xPlus < 0 ? 4 : 6);
            }
        } else {
            if (yPlus !== 0) {
                this.setDirection(yPlus < 0 ? 8 : 2);
            }
        }
        this._x += xPlus;
        this._y += yPlus;
        const distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
        this._jumpPeak = (10 + distance - this._moveSpeed) * (heightRate || 1);
        this._jumpCount = this._jumpPeak * 2;
        this.resetStopCount();
        this.straighten();
    }

})();

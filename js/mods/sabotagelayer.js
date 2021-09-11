class SabotageLayer
{
    constructor()
    {
        this.sabotagePoints = new Decimal(0);
        this.upgrades = {
            sabotageGain: new sabotageUpgrade("Increase your sabotage gain", level => Decimal.pow(1.225, level).mul(100),
                level => Decimal.pow(1.2, level)),
            sabotageGainBonus: new sabotageUpgrade("Get a Bonus to sabotage gain",
                level => Utils.createValueDilation(Decimal.pow(10000, level).mul(10000), 0.03),
                level => new Decimal(1).add(level.mul(0.1)).mul(Decimal.pow(1.05, Decimal.max(level.sub(10), 0))), {
                    getEffectDisplay: effectDisplayTemplates.percentStandard(3, "", " %", 0)
                }),
            metaPowered: new sabotageUpgrade("Power the resource multiplier",
                level => new Decimal(1e7).pow(Decimal.pow(5.3, level)),
                level => Decimal.pow(8,level), {
                    getEffectDisplay: effectDisplayTemplates.numberStandard(3,"^","")
                }),
            sabotageBoost: new sabotageUpgrade("Multiply sabotage gain",
                level => new Decimal(1e20).pow(Decimal.pow(2.2, level)),
                level => Decimal.pow(level+1,6)),
            costDivider: new sabotageUpgrade("Divide the cost of resource multipliers and powerers",
                level => new Decimal(1e25).pow(Decimal.pow(3.4, level)),
                level => Decimal.pow(5,level).floor(), {
                    getEffectDisplay: effectDisplayTemplates.numberStandard(3,"÷","")
                }),
            metaTet: new sabotageUpgrade("Tetrate the resource multiplier",
                level => new Decimal("1e1500"),
                level => level.add(1), {
                    maxLevel: 1,
                    getEffectDisplay: effectDisplayTemplates.numberStandard(0,"^^","")
                }),
            winPercentage: new sabotageUpgrade("increase the percentage of winning because too hard",
                level => new Decimal("eeee308").add(level),
                level => new Decimal("0"), {
                    getEffectDisplay: effectDisplayTemplates.percentStandard(3, "", " %", 0)
                })
        };
    }

    getSabotageGain()
    {
        return this.upgrades.sabotageGain.apply().mul(this.upgrades.sabotageGainBonus.apply())
            .mul(this.getSabotageBoostFromLayer())
            .mul(this.upgrades.sabotageBoost.apply())
    }

    isUnlocked()
    {
        return game.highestUpdatedLayer >= new Decimal("1.8e308");
    }

    getSabotageBoostFromLayer()
    {
        if(game.highestUpdatedLayer < new Decimal("1.8e308")) return new Decimal(0);
        return Decimal.log10(game.metaLayer.layer).sub("308")
    }

    maxAll()
    {
        for(let k of Object.keys(this.upgrades))
        {
            this.upgrades[k].buyMax();
        }
    }

    tick(dt)
    {
        if(this.isUnlocked())
        {
            this.sabotagePoints = this.sabotagePoints.add(this.getSabotageGain().mul(dt));
        }
    }

    loadFromSave(obj)
    {
        this.aleph = obj.aleph;
        for(let k of Object.getOwnPropertyNames(obj.upgrades))
        {
            if(this.upgrades[k])
            {
                this.upgrades[k].level = obj.upgrades[k].level;
            }
        }
    }
}
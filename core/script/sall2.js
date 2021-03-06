var spaghetti_code = !0,
    mi = 1E6,
    bi = 1E3 * mi,
    tri = 1E3 * bi,
    qad = 1E3 * tri,
    GAME_VERSION = 38,
    GAME_SUB_VERSION = "M",
    GAME_DIMX = 1200,
    GAME_DIMY = 600,
    fpsFleet = 10,
    fps = 2,
    MAX_FLEET_EXPERIENCE = 5E3,
    MAX_POLLUTION = 1E3 * bi,
    ATK_TIMER = 500,
    MAX_AUTO_DELIVERY_PER_PLANET = 5,
    averageT = .5,
    repLevel = {
        hostile: {
            min: -1E3,
            max: -1
        },
        neutral: {
            min: 0,
            max: 500
        },
        friendly: {
            min: 501,
            max: 2E3
        },
        allied: {
            min: 2001,
            max: 5E3
        }
    },
    repLoss = {
        hostile: 100,
        neutral: 500,
        frendly: 1499,
        allied: 2999
    },
    kongregate, idleBon = 1,
    idleTimeout, firston = !0,
    currentCriteriaAuto = "all",
    currentCriteria = {
        t: "nowar",
        p: "all"
    },
    oldCriteria = {
        t: "nowar",
        p: "all"
    },
    internalSave = "sdf",
    gameSettings = {
        showBuildingAid: !1,
        techTree: !0,
        scientificNotation: !1,
        allShipres: !0,
        hpreport: !1,
        resourceRequest: !1,
        autoQueue: !1,
        useQueue: !0,
        enemyAI: !1,
        showqd: !1,
        sortResName: !1,
        mapzoomlevel: 1,
        civis: "0",
        tutorialCount: 0,
        hideTutorial: !1,
        populationEnabled: !1,
        showHub: !1,
        showMultipliers: !1
    },
    gameSettingsReset = {
        mapzoomlevel: 1
    };

function addSettingCheck(b, e) {
    gameSettings[e] ? $("#" + b).prop("checked", !0) : $("#" + b).prop("checked", !1);
    $("#" + b).change(function () {
        gameSettings[e] = this.checked
    })
}
var fleetStr = "nada",
    toastTimeout, overviewPlanetExpand, overviewResourceExpand, overviewRoutesExpand, exportUpdateBuildingList, exportExpInterface, exportPermanentMenu, exportShipyardInterface, exportMain = function () {},
    currentFleetId, languages = {
        en: 0,
        it: 1,
        fr: 2,
        de: 3,
        jp: 4,
        ru: 5
    },
    localization = [["Type", "Tipo", ""], ["Radius", "Raggio", ""], ["Temperature", "Temperatura", ""], ["Atmosphere", "Atmosfera"]],
    SchedulerUI = function () {
        this.ui = null;
        this.components = {};
        this.updaters = [];
        this.updatersParam = [];
        this.interfaces = {};
        this.getComponent =
            function (b) {
                return this.components[b]
            };
        this.uiSwitch = function (b) {
            (this.ui = this.getComponent(b)) ? document.getElementById("ui_space") && (document.getElementById("ui_space").innerHTML = this.ui.html(), this.updaters = []): console.log("### SchedulerUI: current UI null at " + b)
        };
        this.uiAdd = function (b) {
            this.components[b.name] = b
        };
        this.uiUpdate = function () {
            for (var b = 0; b < this.updaters.length; b++) this.updaters[b](this.updatersParam[b])
        };
        this.getSpan = function (b) {
            return "<span class='" + (b.color + "_text" || "blue_text") +
                "' style='font-size:" + (b.fontSize || "100%") + "'>" + (b.content || "") + "</span>"
        };
        this.planetInfoUpdater = function (b) {
            b = b[0];
            document.getElementById("popul") && (document.getElementById("popul").innerHTML = beauty(b.population) + " " + (0 < b.globalProd.population + b.populationRatio ? "<span class='green_text'>(+" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>"));
            document.getElementById("habitable") && (document.getElementById("habitable").innerHTML =
                beauty(b.habitableSpace()))
        };
        this.planetInfo = function (b) {
            var e = "<div style='position:relative; left:8px;'>" + ("<span class='blue_text'>Type: </span><span class='white_text'>" + b.type.capitalize() + " planet</span><br>");
            e += "<span class='blue_text'>Radius: </span><span class='white_text'>" + b.info.radius + " km</span><br>";
            e += "<span class='blue_text'>Temperature: </span><span class='white_text'>" + b.info.temp + " \u00b0C</span><br>";
            e += "<span class='blue_text'>Atmosphere: </span><span class='white_text'>" + b.info.atmos +
                "</span><br>";
            e += "<span class='blue_text'>Orbital Distance: </span><span class='white_text'>" + b.info.orbit + " AU</span><br><br>";
            e += "<span class='blue_text'>Influence: </span><span class='white_text'>" + b.influence + "</span><br><br>";
            if (game.searchPlanet(b.id)) {
                e += "<span class='blue_text'>Energy Prod.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(b.energyProduction()) + "</span><br>";
                e += "<span class='blue_text'>Energy Cons.: </span><span class='white_text' style='float:right;margin-right:20%;'>" +
                    Math.floor(-b.energyConsumption()) + "</span><br>";
                var d = Math.floor(b.energyProduction() + b.energyConsumption()),
                    h = b.energyMalus();
                1 < h ? h = 1 : 0 > h && (h = 0);
                var g = "green_text";.85 <= h && 1 > h ? g = "gold_text" : .85 > h && (g = "red_text");
                e += "<span class='blue_text'>Balance: </span><span class='" + g + "' style='float:right;margin-right:20%;'>" + parseInt(Math.floor(d)) + "</span><br>";
                e += "<span class='blue_text'>Efficiency: </span><span class='" + g + "' style='float:right;margin-right:20%;'>" + Math.floor(1E4 * h) / 100 + "%</span><br><br>"
            }
            gameSettings.populationEnabled &&
                (e += "<span class='blue_text'>Population Growth: </span><span id='popGrow' class='white_text' style='float:right;margin-right:20%;'>" + 100 * b.basePopulation + "%" + (0 < b.structure[buildingsName.clonation].number ? "<span class='green_text'>(+" + b.structure[buildingsName.clonation].number + "%)</span>" : "") + "/y</span><br><span class='blue_text'>Population: </span><span id='popul' class='white_text' style='float:right;margin-right:20%;'>" + beauty(b.population) + " " + (0 < b.globalProd.population + b.populationRatio ? "<span class='green_text'>(+" +
                    beauty(b.globalProd.population + b.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>") + "</span><br><span class='blue_text'>Habitable Space: </span><span id='habitable' class='white_text' style='float:right;margin-right:20%;'>" + beauty(b.habitableSpace()) + "</span><br><br>");
            for (d = 0; d < resNum; d++) resources[d].show(game) && (0 < b.baseResources[d] && "ore" == resources[d].type && (e += "<span class='blue_text'>" + resources[d].name.capitalize() + ":</span><span class='white_text' style='float:right;margin-right:20%;'>x" +
                b.baseResources[d].toFixed(2) + "</span><br>"), 1 != b.baseResources[d] && "ore" != resources[d].type && (e += "<span class='green_text'>" + resources[d].name.capitalize() + ":</span><span class='white_text' style='float:right;margin-right:20%;'>x" + b.baseResources[d].toFixed(2) + "</span><br>"));
            e += "</div>";
            this.updaters.push(this.planetInfoUpdater);
            this.updatersParam.push([b]);
            return e
        };
        this.resourcesSort = {
            name: !1
        };
        this.resourcesSortUpdate = function () {
            this.resourcesSort.name = gameSettings.sortResName;
            this.resourcesSort.stock =
                gameSettings.sortResStock
        };
        this.planetResourcesUpdater = function (b) {
            b = b[0];
            var e = "<div style='position:relative; left:8px;'>";
            for (var d = b.rawProduction(), h = Array(resNum), g = 0; g < resNum; g++) h[g] = g;
            gameSettings.sortResName && (h = sortObjIndex(resources, "name"));
            var l = Array(resNum);
            b.importExport();
            for (var m = 0; m < resNum; m++) g = h[m], l[g] = b.globalImport[g] - b.globalExport[g];
            for (m = 0; m < resNum; m++)
                if (g = h[m], resources[g].show(game) || 0 < b.resources[g]) {
                    e += "<div id='res_name_div_" + g + "' ";
                    var t = "<span id='buildingAid_" +
                        g + "'>";
                    highlightProd[g] ? (e += " style='background:rgba(0,255,0,0.3);'>", t += "<img src='ui/arrow_up_green.png' />") : highlightCons[g] ? (e += " style='background:rgba(255,0,0,0.3);'>", t += "<img src='ui/arrow_down_red.png' />") : e = highlightRes[g] ? e + " style='background:rgba(75,129,156,0.3);'>" : e + ">";
                    t += "</span>";
                    e += "<span class='blue_text'>" + resources[g].name.capitalize() + ": </span><span class='white_text' style='margin-righ:16px;font-size:80%' id='res_name_prod_" + g + "' name='" + g + "'>" + beauty(b.resources[g]) + " <span class='" +
                        (0 <= d[g] ? 0 < d[g] ? "green_text" : "gray_text" : "red_text oblique_txt") + "'>(" + (0 < d[g] ? "+" : "") + "" + beauty(d[g]) + "/s)" + t + "</span>";
                    0 != l[g] && (e += "<span class='" + (0 <= l[g] ? 0 < l[g] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < l[g] ? "+" : "") + "" + beauty(l[g]) + "/s)</span>");
                    gameSettings.populationEnabled && g == resourcesName.biomass.id && 0 < (b.population - b.sustainable()) / 5E3 && (e += "<span class='gold_text' id='res_name_prod_biomass' name='" + g + "'>(-" + beauty((b.population - b.sustainable()) / 5E3) + "/s)</span>");
                    e +=
                        "</span></div>"
                }
            return e + "</div>"
        };
        this.planetResources = function (b) {
            var e = "<div style='position:relative; left:8px;'>";
            if (game.searchPlanet(b.id)) {
                for (var d = b.rawProduction(), h = Array(resNum), g = 0; g < resNum; g++) h[g] = g;
                gameSettings.sortResName && (h = sortObjIndex(resources, "name"));
                var l = Array(resNum);
                b.importExport();
                for (var m = 0; m < resNum; m++) g = h[m], l[g] = b.globalImport[g] - b.globalExport[g];
                for (m = 0; m < resNum; m++)
                    if (g = h[m], resources[g].show(game) || 0 < b.resources[g]) {
                        e += "<div id='res_name_div_" + g + "' ";
                        var t =
                            "<span id='buildingAid_" + g + "'>";
                        highlightProd[g] ? (e += " style='background:rgba(0,255,0,0.3);'>", t += "<img src='ui/arrow_up_green.png' />") : highlightCons[g] ? (e += " style='background:rgba(255,0,0,0.3);'>", t += "<img src='ui/arrow_down_red.png' />") : e = highlightRes[g] ? e + " style='background:rgba(75,129,156,0.3);'>" : e + ">";
                        t += "</span>";
                        e += "<span class='blue_text'>" + resources[g].name.capitalize() + ": </span><span class='white_text' style='margin-righ:16px;font-size:80%' id='res_name_prod_" + g + "' name='" + g + "'>" +
                            beauty(b.resources[g]) + " <span class='" + (0 <= d[g] ? 0 < d[g] ? "green_text" : "gray_text" : "red_text oblique_txt") + "'>(" + (0 < d[g] ? "+" : "") + "" + beauty(d[g]) + "/s)" + t + "</span>";
                        0 != l[g] && (e += "<span class='" + (0 <= l[g] ? 0 < l[g] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < l[g] ? "+" : "") + "" + beauty(l[g]) + "/s)</span>");
                        gameSettings.populationEnabled && g == resourcesName.biomass.id && 0 < (b.population - b.sustainable()) / 5E3 && (e += "<span class='gold_text' id='res_name_prod_biomass' name='" + g + "'>(-" + beauty((b.population -
                            b.sustainable()) / 5E3) + "/s)</span>");
                        e += "</span></div>"
                    }
                this.updaters.push(this.planetResourcesUpdater);
                this.updatersParam.push([b])
            }
            return e + "</div>"
        };
        this.fleetInfo = function (b, e, d) {
            var h = d.name;
            "hub" == e && (h = planets[b].name + " Hub Fleet");
            d.civis != game.id ? $("#ship_info_name").html("<span class='red_text_n'>" + h + "</span><br><span class='red_text' style='font-size: 80%;'>(" + civis[d.civis].name + ")</span>") : $("#ship_info_name").html(h);
            b = "<ul id='ship_info_list' style='position:absolute; text-align:right; top:48px; margin-top:16px; clear:both;'><div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Information</span><br><br>" +
                ("<span class='blue_text' style='float:left;margin-left:16px;'>Civilization: </span><span class='white_text' >" + civis[d.civis].name + "</span><br>");
            b += "<span class='blue_text' style='float:left;margin-left:16px;'>Military Value: </span><span class='white_text' >" + beauty(d.value()) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;'>Experience: </span><span class='white_text' >" + beauty(d.exp) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;'>Total Power: </span><span class='white_text' id='ammo_bonus'>" +
                beauty(d.power()) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;'>Total HP: </span><span class='white_text'>" + beauty(d.hp()) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;'>Speed: </span><span class='white_text'>" + Math.floor(100 * d.speed()) / 100 + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;'>Total Storage: </span><span class='white_text'>" + beauty(d.maxStorage()) + "</span><br>";
            e = 0;
            b = b + "</div><br><div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Storage</span><br><br>" +
                ("<span class='blue_text' style='float:left;margin-left:16px;'>Storage left: </span><span class='white_text'>" + beauty(parseInt(Math.floor(d.availableStorage()))) + "</span><br>");
            for (h = 0; h < resNum; h++) 0 < d.storage[h] && (e++, b += "<span class='blue_text' style='float:left;margin-left:16px;'>" + resources[h].name.capitalize() + ": </span><span class='white_text'>" + beauty(parseInt(Math.floor(d.storage[h]))) + "</span><br>");
            b += "</div><br><div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Ships</span><br><br>";
            for (h = 0; h < ships.length; h++) 0 < d.ships[h] && (b += "<span class='blue_text' style='float:left;margin-left:16px;' id='ship_name_infos_" + h + "' name='" + h + "'>" + ships[h].name + "</span></span><span class='white_text'>" + d.ships[h] + "</span><br>", e++);
            return {
                html: b + "</div><br><br>",
                cnt: e
            }
        };
        this.civisInfo = function (b) {
            var e = "" + ("<li style='height:80px;width:100%;'><img src='ui/civis/" + civis[b].playerName + ".png' style='left:5%; height:64px;width:64px;position:absolute;' /><span class='blue_text' style='position:absolute;top:8px;left:120px;font-size:280%;width:100%;'>" +
                civis[b].name + "</span></li>");
            e += "<li style='height:60px;width:100%;'>";
            var d = [];
            if (0 >= civis[b].planets.length) e += "<span style='position:absolute;top:92px;left:16px;font-size:110%' class='red_text'>This civilization has been conquered</span>";
            else {
                e += "<span class='blue_text' style='position:absolute;top:92px;left:16px;font-size:100%;width:100%;'>Planets:</span><div style='position:absolute;left:100px;'>";
                for (var h = 0; h < civis[b].planets.length; h++) {
                    var g = civis[b].planets[h],
                        l = 0;
                    planets[game.capital].shortestPath[g] ?
                        l = planets[game.capital].shortestPath[g].hops : planets[planetsName.solidad].shortestPath[g] && (l = planets[game.capital].shortestPath[planetsName.xora].hops + planets[planetsName.solidad].shortestPath[g].hops);
                    l <= game.researches[3].level ? (e += "<img id='civis_plt_" + g + "' name='" + g + "' src='img/" + planets[g].icon + "/" + planets[g].icon + ".png' style='height:48px;width:48px;' />", d.push(g)) : e += "<img src='img/unknown.png'  style='height:48px;width:48px;' style='' />"
                }
                e += "</div>"
            }
            e = e + "</li><li style='position:relative;left:16px;width:776px;'>" +
                ("<span class='blue_text'>Description: </span><span class='white_text'>" + civis[b].description + "</span>");
            e = e + "</li><li style='position:relative;left:16px'>" + ("<div style='position:absolute;top:16px;'><span class='blue_text'>Reputation Points: </span><span class='white_text'>" + game.reputation[b] + " (" + game.repName(b).capitalize() + ")</span></div>");
            g = 0;
            e += "<div style='position:absolute;top:16px;left:30%'><span class='blue_text'>Attitude: </span><span class='white_text'>";
            for (h = 0; h < civis[b].traits.length; h++) e +=
                civis[b].traits[h].name.capitalize(), h < civis[b].traits.length - 1 && (e += ", "), g++;
            e += "</span>";
            0 == g && (e += "<span class='white_text'>Unknown</span>");
            e = e + "</div>" + ("<div style='position:absolute;top:16px;left:60%'><span class='blue_text'>Government: </span><span class='white_text'>" + civis[b].govern + "</span></div>");
            e += "</li><li style='position:relative;left:16px;top:32px;height:200px'><br><span class='blue_text'>Allegiance: </span><br>";
            for (h = 1; h < civis.length; h++) parseInt(b) != h && civis[h].contacted() &&
                ("hostile" == civis[b].repName(h) ? e += "<span class='red_text'>" + civis[h].name + " (Hostile)</span><br>" : "friendly" == civis[b].repName(h) ? e += "<span class='white_text'>" + civis[h].name + " (Friendly)</span><br>" : "allied" == civis[b].repName(h) && (e += "<span class='green_text'>" + civis[h].name + " (Allied)</span><br>"));
            e += "</li>";
            g = 0;
            h = [];
            for (var m in civisQuest[b]) quests[m].available() && g++;
            if (0 < g && 0 < civis[b].planets.length) {
                e += "<li style='position:relative;left:16px;height:64px'><span class='blue_text' style='font-size:200%'>Missions</span>";
                l = g = "";
                for (m in civisQuest[b]) {
                    var t = quests[m];
                    if (t.available()) {
                        var x = "blue_text",
                            C = "white_text",
                            E = "";
                        t.done && (C = x = "green_text", E = "COMPLETED - ");
                        var F = "";
                        F += "<li style='position:relative;left:16px;height:auto'>";
                        F += "<span class='" + x + "' style='font-size:130%'>" + E + t.name + "</span>";
                        t.checkCompletion() && (E = new exportButton("quest__claim__" + t.id, "<span class='green_text'>Claim Reward</span>", 180, 32, function () {
                            var b = $(this).attr("id").split("__");
                            quests[questNames[b[2]]].checkCompletion() ? quests[questNames[b[2]]].reward() :
                                (new exportPopup(300, 0, "<br><span class='red_text text_shadow'>This quest can not be completed. Check the requirements</span>", "info")).drawToast();
                            exportDiplomacyInterface(quests[questNames[b[2]]].provider);
                            save()
                        }), F += "<span style='position:absolute;right:32px;top:-4px' style='font-size:130%'>" + E.getHtml() + "</span>", h.push(E));
                        F += "<br><br>";
                        F += "<span class='" + C + "' style=''>" + t.description + "</span><br><br>";
                        F += "<span class='" + x + "' style=''>Objective: </span>" + t.objective + "<br><br>";
                        F += "<span class='" +
                            x + "' style=''>Reward: </span><span class='" + C + "' style=''>" + t.repReward + " rep. with </span><span class='" + x + "' style=''>" + civis[t.provider].name + "</span>";
                        t.bonusDescription && (F += "<span class='" + C + "' style=''>, </span>" + t.bonusDescription);
                        F += "<br><br><span class='" + C + "'></span></li>";
                        t.done ? g += F : l += F
                    }
                }
                e = e + (l + g) + "<li style='position:relative;left:16px;height:0px'></li></li>"
            }
            e += "<img src='ui/banners/" + civis[b].playerName + ".png' style='position:absolute;top:0%;right:8px'/>";
            return {
                html: e,
                toBind: d,
                buttons: h
            }
        }
    },
    uiScheduler = new SchedulerUI,
    Base64String = {
        compressToUTF16: function (b) {
            var e = [],
                d, h = 0;
            b = this.compress(b);
            for (d = 0; d < b.length; d++) {
                var g = b.charCodeAt(d);
                switch (h++) {
                    case 0:
                        e.push(String.fromCharCode((g >> 1) + 32));
                        var l = (g & 1) << 14;
                        break;
                    case 1:
                        e.push(String.fromCharCode(l + (g >> 2) + 32));
                        l = (g & 3) << 13;
                        break;
                    case 2:
                        e.push(String.fromCharCode(l + (g >> 3) + 32));
                        l = (g & 7) << 12;
                        break;
                    case 3:
                        e.push(String.fromCharCode(l + (g >> 4) + 32));
                        l = (g & 15) << 11;
                        break;
                    case 4:
                        e.push(String.fromCharCode(l + (g >> 5) + 32));
                        l = (g & 31) << 10;
                        break;
                    case 5:
                        e.push(String.fromCharCode(l + (g >> 6) + 32));
                        l = (g & 63) << 9;
                        break;
                    case 6:
                        e.push(String.fromCharCode(l + (g >> 7) + 32));
                        l = (g & 127) << 8;
                        break;
                    case 7:
                        e.push(String.fromCharCode(l + (g >> 8) + 32));
                        l = (g & 255) << 7;
                        break;
                    case 8:
                        e.push(String.fromCharCode(l + (g >> 9) + 32));
                        l = (g & 511) << 6;
                        break;
                    case 9:
                        e.push(String.fromCharCode(l + (g >> 10) + 32));
                        l = (g & 1023) << 5;
                        break;
                    case 10:
                        e.push(String.fromCharCode(l + (g >> 11) + 32));
                        l = (g & 2047) << 4;
                        break;
                    case 11:
                        e.push(String.fromCharCode(l + (g >> 12) + 32));
                        l = (g & 4095) << 3;
                        break;
                    case 12:
                        e.push(String.fromCharCode(l +
                            (g >> 13) + 32));
                        l = (g & 8191) << 2;
                        break;
                    case 13:
                        e.push(String.fromCharCode(l + (g >> 14) + 32));
                        l = (g & 16383) << 1;
                        break;
                    case 14:
                        e.push(String.fromCharCode(l + (g >> 15) + 32, (g & 32767) + 32)), h = 0
                }
            }
            e.push(String.fromCharCode(l + 32));
            return e.join("")
        },
        decompressFromUTF16: function (b) {
            for (var e = [], d, h, g = 0, l = 0; l < b.length;) {
                h = b.charCodeAt(l) - 32;
                switch (g++) {
                    case 0:
                        d = h << 1;
                        break;
                    case 1:
                        e.push(String.fromCharCode(d | h >> 14));
                        d = (h & 16383) << 2;
                        break;
                    case 2:
                        e.push(String.fromCharCode(d | h >> 13));
                        d = (h & 8191) << 3;
                        break;
                    case 3:
                        e.push(String.fromCharCode(d |
                            h >> 12));
                        d = (h & 4095) << 4;
                        break;
                    case 4:
                        e.push(String.fromCharCode(d | h >> 11));
                        d = (h & 2047) << 5;
                        break;
                    case 5:
                        e.push(String.fromCharCode(d | h >> 10));
                        d = (h & 1023) << 6;
                        break;
                    case 6:
                        e.push(String.fromCharCode(d | h >> 9));
                        d = (h & 511) << 7;
                        break;
                    case 7:
                        e.push(String.fromCharCode(d | h >> 8));
                        d = (h & 255) << 8;
                        break;
                    case 8:
                        e.push(String.fromCharCode(d | h >> 7));
                        d = (h & 127) << 9;
                        break;
                    case 9:
                        e.push(String.fromCharCode(d | h >> 6));
                        d = (h & 63) << 10;
                        break;
                    case 10:
                        e.push(String.fromCharCode(d | h >> 5));
                        d = (h & 31) << 11;
                        break;
                    case 11:
                        e.push(String.fromCharCode(d |
                            h >> 4));
                        d = (h & 15) << 12;
                        break;
                    case 12:
                        e.push(String.fromCharCode(d | h >> 3));
                        d = (h & 7) << 13;
                        break;
                    case 13:
                        e.push(String.fromCharCode(d | h >> 2));
                        d = (h & 3) << 14;
                        break;
                    case 14:
                        e.push(String.fromCharCode(d | h >> 1));
                        d = (h & 1) << 15;
                        break;
                    case 15:
                        e.push(String.fromCharCode(d | h)), g = 0
                }
                l++
            }
            return this.decompress(e.join(""))
        },
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        decompress: function (b) {
            for (var e = [], d, h, g, l, m, t, x = 1, C = b.charCodeAt(0) >> 8; x < 2 * b.length && (x < 2 * b.length - 1 || 0 == C);) {
                0 == x % 2 ? (d = b.charCodeAt(x /
                    2) >> 8, h = b.charCodeAt(x / 2) & 255, g = x / 2 + 1 < b.length ? b.charCodeAt(x / 2 + 1) >> 8 : NaN) : (d = b.charCodeAt((x - 1) / 2) & 255, (x + 1) / 2 < b.length ? (h = b.charCodeAt((x + 1) / 2) >> 8, g = b.charCodeAt((x + 1) / 2) & 255) : h = g = NaN);
                x += 3;
                l = d >> 2;
                d = (d & 3) << 4 | h >> 4;
                m = (h & 15) << 2 | g >> 6;
                t = g & 63;
                if (isNaN(h) || x == 2 * b.length + 1 && C) m = t = 64;
                else if (isNaN(g) || x == 2 * b.length && C) t = 64;
                e.push(this._keyStr.charAt(l));
                e.push(this._keyStr.charAt(d));
                e.push(this._keyStr.charAt(m));
                e.push(this._keyStr.charAt(t))
            }
            return e.join("")
        },
        compress: function (b) {
            var e = [],
                d = 1,
                h = 0;
            var g = !1;
            for (b = b.replace(/[^A-Za-z0-9\+\/=]/g, ""); h < b.length;) {
                g = this._keyStr.indexOf(b.charAt(h++));
                var l = this._keyStr.indexOf(b.charAt(h++));
                var m = this._keyStr.indexOf(b.charAt(h++));
                var t = this._keyStr.indexOf(b.charAt(h++));
                g = g << 2 | l >> 4;
                l = (l & 15) << 4 | m >> 2;
                var x = (m & 3) << 6 | t;
                if (0 == d % 2) {
                    var C = g << 8;
                    g = !0;
                    64 != m && (e.push(String.fromCharCode(C | l)), g = !1);
                    64 != t && (C = x << 8, g = !0)
                } else e.push(String.fromCharCode(C | g)), g = !1, 64 != m && (C = l << 8, g = !0), 64 != t && (e.push(String.fromCharCode(C | x)), g = !1);
                d += 3
            }
            g ? (e.push(String.fromCharCode(C)),
                e = e.join(""), e = String.fromCharCode(e.charCodeAt(0) | 256) + e.substring(1)) : e = e.join("");
            return e
        }
    },
    LZString = function () {
        function b(b, e) {
            if (!d[b]) {
                d[b] = {};
                for (var g = 0; g < b.length; g++) d[b][b.charAt(g)] = g
            }
            return d[b][e]
        }
        var e = String.fromCharCode,
            d = {},
            h = {
                compressToBase64: function (b) {
                    if (null == b) return "";
                    b = h._compress(b, 6, function (b) {
                        return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b)
                    });
                    switch (b.length % 4) {
                        default:
                            case 0:
                            return b;
                        case 1:
                                return b + "===";
                        case 2:
                                return b + "==";
                        case 3:
                                return b +
                                "="
                    }
                },
                decompressFromBase64: function (d) {
                    return null == d ? "" : "" == d ? null : h._decompress(d.length, 32, function (e) {
                        return b("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", d.charAt(e))
                    })
                },
                compressToUTF16: function (b) {
                    return null == b ? "" : h._compress(b, 15, function (b) {
                        return e(b + 32)
                    }) + " "
                },
                decompressFromUTF16: function (b) {
                    return null == b ? "" : "" == b ? null : h._decompress(b.length, 16384, function (d) {
                        return b.charCodeAt(d) - 32
                    })
                },
                compressToUint8Array: function (b) {
                    b = h.compress(b);
                    for (var d = new Uint8Array(2 *
                            b.length), e = 0, g = b.length; g > e; e++) {
                        var x = b.charCodeAt(e);
                        d[2 * e] = x >>> 8;
                        d[2 * e + 1] = x % 256
                    }
                    return d
                },
                decompressFromUint8Array: function (b) {
                    if (null === b || void 0 === b) return h.decompress(b);
                    for (var d = Array(b.length / 2), g = 0, t = d.length; t > g; g++) d[g] = 256 * b[2 * g] + b[2 * g + 1];
                    var x = [];
                    return d.forEach(function (b) {
                        x.push(e(b))
                    }), h.decompress(x.join(""))
                },
                compressToEncodedURIComponent: function (b) {
                    return null == b ? "" : h._compress(b, 6, function (b) {
                        return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".charAt(b)
                    })
                },
                decompressFromEncodedURIComponent: function (d) {
                    return null == d ? "" : "" == d ? null : (d = d.replace(/ /g, "+"), h._decompress(d.length, 32, function (e) {
                        return b("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", d.charAt(e))
                    }))
                },
                compress: function (b) {
                    return h._compress(b, 16, function (b) {
                        return e(b)
                    })
                },
                _compress: function (b, d, e) {
                    if (null == b) return "";
                    var g, h, l = {},
                        m = {},
                        F = "",
                        z = "",
                        v = "",
                        y = 2,
                        H = 3,
                        A = 2,
                        I = [],
                        B = 0,
                        n = 0;
                    for (h = 0; h < b.length; h += 1)
                        if (F = b.charAt(h), Object.prototype.hasOwnProperty.call(l, F) || (l[F] = H++, m[F] = !0), z = v + F, Object.prototype.hasOwnProperty.call(l, z)) v = z;
                        else {
                            if (Object.prototype.hasOwnProperty.call(m, v)) {
                                if (256 > v.charCodeAt(0)) {
                                    for (g = 0; A > g; g++) B <<= 1, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++;
                                    var G = v.charCodeAt(0);
                                    for (g = 0; 8 > g; g++) B = B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1
                                } else {
                                    G = 1;
                                    for (g = 0; A > g; g++) B = B << 1 | G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G = 0;
                                    G = v.charCodeAt(0);
                                    for (g = 0; 16 > g; g++) B = B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1
                                }
                                y--;
                                0 == y && (y = Math.pow(2, A), A++);
                                delete m[v]
                            } else
                                for (G = l[v], g = 0; A > g; g++) B =
                                    B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1;
                            y--;
                            0 == y && (y = Math.pow(2, A), A++);
                            l[z] = H++;
                            v = String(F)
                        }
                    if ("" !== v) {
                        if (Object.prototype.hasOwnProperty.call(m, v)) {
                            if (256 > v.charCodeAt(0)) {
                                for (g = 0; A > g; g++) B <<= 1, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++;
                                G = v.charCodeAt(0);
                                for (g = 0; 8 > g; g++) B = B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1
                            } else {
                                G = 1;
                                for (g = 0; A > g; g++) B = B << 1 | G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G = 0;
                                G = v.charCodeAt(0);
                                for (g = 0; 16 > g; g++) B = B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1
                            }
                            y--;
                            0 == y && (y = Math.pow(2,
                                A), A++);
                            delete m[v]
                        } else
                            for (G = l[v], g = 0; A > g; g++) B = B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1;
                        y--;
                        0 == y && A++
                    }
                    G = 2;
                    for (g = 0; A > g; g++) B = B << 1 | 1 & G, n == d - 1 ? (n = 0, I.push(e(B)), B = 0) : n++, G >>= 1;
                    for (;;) {
                        if (B <<= 1, n == d - 1) {
                            I.push(e(B));
                            break
                        }
                        n++
                    }
                    return I.join("")
                },
                decompress: function (b) {
                    return null == b ? "" : "" == b ? null : h._decompress(b.length, 32768, function (d) {
                        return b.charCodeAt(d)
                    })
                },
                _decompress: function (b, d, h) {
                    var g, l, m = [],
                        E = 4,
                        F = 4,
                        z = 3,
                        v = [],
                        y = h(0),
                        H = d,
                        A = 1;
                    for (g = 0; 3 > g; g += 1) m[g] = g;
                    var I = 0;
                    var B = Math.pow(2, 2);
                    for (l =
                        1; l != B;) {
                        var n = y & H;
                        H >>= 1;
                        0 == H && (H = d, y = h(A++));
                        I |= (0 < n ? 1 : 0) * l;
                        l <<= 1
                    }
                    switch (I) {
                        case 0:
                            I = 0;
                            B = Math.pow(2, 8);
                            for (l = 1; l != B;) n = y & H, H >>= 1, 0 == H && (H = d, y = h(A++)), I |= (0 < n ? 1 : 0) * l, l <<= 1;
                            var G = e(I);
                            break;
                        case 1:
                            I = 0;
                            B = Math.pow(2, 16);
                            for (l = 1; l != B;) n = y & H, H >>= 1, 0 == H && (H = d, y = h(A++)), I |= (0 < n ? 1 : 0) * l, l <<= 1;
                            G = e(I);
                            break;
                        case 2:
                            return ""
                    }
                    g = m[3] = G;
                    for (v.push(G);;) {
                        if (A > b) return "";
                        I = 0;
                        B = Math.pow(2, z);
                        for (l = 1; l != B;) n = y & H, H >>= 1, 0 == H && (H = d, y = h(A++)), I |= (0 < n ? 1 : 0) * l, l <<= 1;
                        switch (G = I) {
                            case 0:
                                I = 0;
                                B = Math.pow(2, 8);
                                for (l = 1; l != B;) n = y &
                                    H, H >>= 1, 0 == H && (H = d, y = h(A++)), I |= (0 < n ? 1 : 0) * l, l <<= 1;
                                m[F++] = e(I);
                                G = F - 1;
                                E--;
                                break;
                            case 1:
                                I = 0;
                                B = Math.pow(2, 16);
                                for (l = 1; l != B;) n = y & H, H >>= 1, 0 == H && (H = d, y = h(A++)), I |= (0 < n ? 1 : 0) * l, l <<= 1;
                                m[F++] = e(I);
                                G = F - 1;
                                E--;
                                break;
                            case 2:
                                return v.join("")
                        }
                        if (0 == E && (E = Math.pow(2, z), z++), m[G]) G = m[G];
                        else {
                            if (G !== F) return null;
                            G = g + g.charAt(0)
                        }
                        v.push(G);
                        m[F++] = g + G.charAt(0);
                        E--;
                        g = G;
                        0 == E && (E = Math.pow(2, z), z++)
                    }
                }
            };
        return h
    }();
"function" == typeof define && define.amd ? define(function () {
    return LZString
}) : "undefined" != typeof module && null != module && (module.exports = LZString);
Array.prototype.min = function () {
    for (var b = this[0], e = 1; e < this.length; e++) this[e] < b && (b = this[e]);
    return b
};
Array.prototype.max = function () {
    for (var b = this[0], e = 1; e < this.length; e++) this[e] > b && (b = this[e]);
    return b
};
Array.prototype.idMin = function () {
    for (var b = 0, e = 1; e < this.length; e++) this[e] < this[b] && (b = e);
    return b
};
Array.prototype.idMax = function () {
    for (var b = 0, e = 1; e < this.length; e++) this[e] > this[b] && (b = e);
    return b
};
Array.prototype.find = function (b) {
    for (var e = 0; e < this.length && this[e] != b;) e++;
    return e
};
Array.prototype.has = function (b) {
    for (var e = !1, d = 0; d < this.length && !e;) this[d] == b && (e = !0), d++;
    return e
};

function arraySort(b) {
    b.sort(function (b, d) {
        return b < d ? -1 : b > d ? 1 : 0
    })
}
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
};

function beauty(b) {
    if (gameSettings.scientificNotation) return 1E4 <= Math.abs(b) ? b.toExponential(3) : 1E3 <= Math.abs(b) ? b.toFixed(0) : 100 <= Math.abs(b) ? b.toFixed(1) : b.toFixed(2);
    var e = "";
    0 > b && (e = "-");
    var d = Math.floor(Math.abs(b)) || 0;
    return d >= bi * bi * bi * bi ? e + (d / bi / bi / bi / bi).toFixed(2) + "Ud" : d >= mi * bi * bi * bi ? e + (d / mi / bi / bi / bi).toFixed(2) + "Dc" : d >= 1E3 * bi * bi * bi ? e + (d / 1E3 / bi / bi / bi).toFixed(2) + "No" : d >= bi * bi * bi ? e + (d / bi / bi / bi).toFixed(2) + "Oc" : d >= mi * bi * bi ? e + (d / mi / bi / bi).toFixed(2) + "Sp" : d >= 1E3 * bi * bi ? e + (d / 1E3 / bi / bi).toFixed(2) +
        "Sx" : d >= bi * bi ? e + (d / bi / bi).toFixed(2) + "Qi" : d >= mi * bi ? e + (d / mi / bi).toFixed(2) + "Qa" : d >= 1E3 * bi ? e + (d / 1E3 / bi).toFixed(2) + "T" : d >= bi ? e + (d / bi).toFixed(2) + "B" : d >= mi ? e + (d / mi).toFixed(2) + "M" : 1E3 <= d ? e + (d / 1E3).toFixed(2) + "K" : 100 <= d ? e + d.toFixed(1) : e + Math.abs(b).toFixed(2)
}

function parseBeauty(b) {
    b = ("" + b).replace(/,/g, "");
    b = b.split(/(?=[a-zA-Z])/g);
    return parseFloat(b[0]) * qton(b[1])
}

function qton(b) {
    var e = 1;
    b && ("K" == b.toUpperCase() ? e = 1E3 : "M" == b.toUpperCase() ? e = mi : "B" == b.toUpperCase() ? e = bi : "T" == b.toUpperCase() ? e = tri : "QA" == b.toUpperCase() ? e = 1E3 * tri : "QI" == b.toUpperCase() ? e = mi * tri : "SX" == b.toUpperCase() ? e = bi * tri : "SP" == b.toUpperCase() ? e = tri * tri : "OC" == b.toUpperCase() ? e = 1E3 * tri * tri : "NO" == b.toUpperCase() ? e = mi * tri * tri : "DE" == b.toUpperCase() && (e = bi * tri * tri));
    return e
}

function qtonTest(b) {
    for (var e = 0, d = 0; d < b; d++) {
        var h = Math.random() + .01;
        h = Math.pow(h, 10) * tri;
        var g = beauty(h);
        g = parseBeauty(g);
        var l = Math.abs(h - g) / Math.abs(h);
        1 > l && (e = Math.max(l, e), .1 < l && console.log(h + " " + g + " " + l))
    }
    console.log(e)
}
var rNum = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX".split(" ");

function romanize(b) {
    if (0 == b) return "";
    if (10 > b) return rNum[parseInt(b - 1)];
    if (40 > b) {
        for (var e = "", d = 0; d < parseInt(b / 10) % 10; d++) e += "X";
        return e += romanize(b % 10)
    }
    if (50 > b) return "XL" + romanize(b % 10);
    if (90 > b) {
        e = "L";
        var h = parseInt(b / 10) - 5;
        for (d = 0; d < h; d++) e += "X";
        return e + romanize(parseInt(b % 10))
    }
    if (100 > b) return "XC" + romanize(parseInt(b % 10));
    if (400 > b) {
        e = "";
        for (d = 0; d < parseInt(b / 100) % 10; d++) e += "C";
        return e + romanize(b % 100)
    }
}

function Artifact(b) {
    this.id = b.id;
    this.name = b.name;
    this.description = b.desription;
    this.sticky = b.sticky;
    this.activated = this.possessed = !1;
    this.action = b.action || function () {};
    this.unaction = b.unaction || function () {};
    this.collect = function () {
        this.possessed || (this.possessed = !0, this.action())
    };
    this.uncollect = function () {
        this.possessed && (this.possessed = !1, this.unaction())
    }
}
var artifacts = [];
artifacts.push(new Artifact({
    id: "aurea_core",
    name: "Aurea Core",
    description: "This luminescent gold artifact boosts <span style='blue_text'>Rhodium</span> and <span style='blue_text'>Osmium</span> production by +100%",
    sticky: !1
}));
artifacts.push(new Artifact({
    id: "thoroid",
    name: "Mysterious Thoroid",
    description: "This ancient relics is still a marvelous wonder of human engineering. +10% power to all ballistic ships",
    sticky: !0,
    action: function () {
        for (var b = 0; b < game.ships.length; b++) "ballistic" == game.ships[b].weapon && (game.ships[b].power *= 1.1)
    },
    unaction: function () {
        for (var b = 0; b < game.ships.length; b++) "ballistic" == game.ships[b].weapon && (game.ships[b].power /= 1.1)
    }
}));
artifacts.push(new Artifact({
    id: "magnet",
    name: "Self Levitating Magnet",
    description: "This powerful magnet boosts production of <span style='blue_text'>Silicon</span> by +25%"
}));
artifacts.push(new Artifact({
    id: "necklace",
    name: "Utoma's Necklace",
    description: "This powerful magnet boosting production of <span style='blue_text'>Silicon</span> by +25%"
}));
artifacts.push(new Artifact({
    id: "ancient",
    name: "Idol of Ancient Haleans",
    description: "The following inscription is carved in this relic: Mihra min mi lura krasusia ruthen, Muhra mun mu lura silinusia serul, pachra pan pa lura cininusia pharun"
}));
artifacts.push(new Artifact({
    id: "shard",
    name: "Emerald Shard",
    description: "This powerful magnet boosting production of <span style='blue_text'>Silicon</span> by +25%"
}));
artifacts.push(new Artifact({
    id: "book_of_life",
    name: "Juini's Book of Life",
    description: "This powerful magnet boosting production of <span style='blue_text'>Silicon</span> by +25%"
}));
artifacts.push(new Artifact({
    id: "stone",
    name: "Ling-Wa Stone",
    description: "The rosetta stone of galactic era. Some inscription are still visible: us - iron - ?,  krasnus - ? - rodj, cinii - blue - ?,  mi - ? - un, ma - ? - dva, mu - three - ?, lura - million - ?"
}));
artifacts.push(new Artifact({
    id: "shard",
    name: "Shard ",
    description: "This powerful magnet boosting production of <span style='blue_text'>Silicon</span> by +25%"
}));
artifacts.push(new Artifact({
    id: "quris_value",
    name: "Quris Medal of Value",
    description: "A reward for your military value, a great honor for Quris. <span style='blue_text'>+50%</span> to all ships hp",
    action: function () {
        for (var b = 0; b < game.ships.length; b++) game.ships[b].armor *= 1.5
    },
    unaction: function () {
        for (var b = 0; b < game.ships.length; b++) game.ships[b].armor /= 1.5
    }
}));
artifacts.push(new Artifact({
    id: "quris_honor",
    name: "Quris Medal of Honor",
    description: "A reward for your military honor that earns you the respect of Quris people. <span style='blue_text'>+50%</span> to all ships shields",
    action: function () {
        for (var b = 0; b < game.ships.length; b++) game.ships[b].shield *= 1.5
    },
    unaction: function () {
        for (var b = 0; b < game.ships.length; b++) game.ships[b].shield /= 1.5
    }
}));
for (var artifactsName = [], a = 0; a < artifacts.length; a++) artifactsName[artifacts[a].id] = a;
var alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012345678901234567890123456789",
    numeric = "0123456789";

function randomString(b) {
    b = b || 8;
    for (var e = "", d = 0; d < b; d++) e += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
    return e
}

function randomNumericString(b) {
    b = b || 6;
    for (var e = "", d = 0; d < b; d++) e += numeric.charAt(Math.floor(Math.random() * numeric.length));
    return e
}

function Article(b, e, d, h) {
    this.name = b;
    this.type = e;
    this.cost = [];
    for (b = 0; b < resNum; b++) this.cost[b] = 0;
    for (b = 0; b < h.length; b++) this.cost[h[b][0]] = h[b][1];
    this.prob = function () {};
    this.effect = function () {};
    this.desc = d
}
var questNames = [];

function Resource(b) {
    this.id = b.id;
    this.name = b.name;
    this.type = b.type || "ore";
    this.value = b.value || 0;
    this.requirement = {};
    for (var e in b.req) this.requirement[e] = b.req[e];
    this.quests = {};
    for (e in b.quests) this.quests[e] = questNames[e];
    this.prodValue = function (b) {
        for (var d = 0, e = 0, l = 0; l < b.planets.length; l++) {
            var m = planets[b.planets[l]];
            d += m.resources[this.id];
            e += m.globalProd[this.id] + m.globalImport[this.id] - m.globalExport[this.id]
        }
        return Math.log(1 + d) / 10 - Math.log(1 + Math.abs(e))
    };
    this.show = function (b) {
        var d = 0,
            e;
        for (e in this.requirement) {
            if (this.requirement[e] <= b.researches[researchesName[e]].level) return !0;
            d++
        }
        for (e in this.quests) {
            if (quests[questNames[e]].done) return !0;
            d++
        }
        return d ? !1 : !0
    }
}
var resources = [],
    resourcesName = [];
resources[0] = new Resource({
    id: 0,
    name: "iron",
    value: 16,
    category: "extraction",
    functional: "construction"
});
resources[1] = new Resource({
    id: 1,
    name: "steel",
    type: "prod",
    value: 4,
    category: "production",
    functional: "construction"
});
resources[2] = new Resource({
    id: 2,
    name: "titanium",
    value: 3,
    req: {
        mineralogy: 4
    },
    category: "extraction",
    functional: "construction"
});
resources[3] = new Resource({
    id: 3,
    name: "silicon",
    type: "prod",
    req: {
        electronics: 1
    },
    value: 11,
    category: "production",
    functional: "refining"
});
resources[4] = new Resource({
    id: 4,
    name: "graphite",
    value: 7,
    category: "extraction",
    functional: "refining"
});
resources[5] = new Resource({
    id: 5,
    name: "oil",
    value: 2,
    req: {
        chemical: 1
    },
    category: "extraction",
    functional: "refining"
});
resources[6] = new Resource({
    id: 6,
    name: "fuel",
    type: "prod",
    value: 6,
    category: "production",
    functional: "energy"
});
resources[7] = new Resource({
    id: 7,
    name: "hydrogen",
    category: "extraction",
    req: {
        hydro: 1,
        nuclear: 1
    },
    functional: "energy"
});
resources[8] = new Resource({
    id: 8,
    name: "oxygen",
    req: {
        nononono: 1
    },
    category: "production",
    functional: "population"
});
resources[9] = new Resource({
    id: 9,
    name: "methane",
    category: "extraction",
    functional: "refining"
});
resources[10] = new Resource({
    id: 10,
    name: "water",
    req: {
        hydro: 1
    },
    category: "extraction",
    functional: "refining"
});
resources[11] = new Resource({
    id: 11,
    name: "osmium",
    req: {
        osmium: 1
    },
    category: "extraction",
    functional: "construction"
});
resources[12] = new Resource({
    id: 12,
    name: "technetium",
    type: "prod",
    req: {
        halean: 1
    },
    functional: "construction"
});
resources[13] = new Resource({
    id: 13,
    name: "rhodium",
    req: {
        rhodium: 1
    },
    category: "extraction",
    functional: "construction"
});
resources[14] = new Resource({
    id: 14,
    name: "uranium",
    req: {
        mineralogy: 4
    },
    category: "extraction",
    functional: "energy"
});
resources[15] = new Resource({
    id: 15,
    name: "plastic",
    type: "prod",
    req: {
        chemical: 4
    },
    value: 29,
    category: "production",
    functional: "construction"
});
resources[16] = new Resource({
    id: 16,
    name: "circuit",
    type: "prod",
    req: {
        electronics: 1
    },
    value: 18,
    category: "production",
    functional: "construction"
});
resources[17] = new Resource({
    id: 17,
    name: "nanotubes",
    type: "prod",
    req: {
        material: 14
    },
    category: "production",
    functional: "construction"
});
resources[18] = new Resource({
    id: 18,
    name: "ice",
    req: {
        ice: 1
    },
    category: "extraction",
    functional: "refining"
});
resources[19] = new Resource({
    id: 19,
    name: "biomass",
    category: "extraction",
    functional: "population",
    req: {
        environment: 1
    }
});
resources[20] = new Resource({
    id: 20,
    name: "ammunition",
    type: "prod",
    req: {
        military: 1
    },
    quests: {
        city_5: 0
    },
    category: "military",
    functional: "military"
});
resources[21] = new Resource({
    id: 21,
    name: "sand",
    req: {
        mineralogy: 4
    },
    category: "extraction",
    functional: "refining"
});
resources[22] = new Resource({
    id: 22,
    name: "empty cryocell",
    type: "prod",
    req: {
        nononono: 2
    },
    category: "production",
    functional: "population"
});
resources[23] = new Resource({
    id: 23,
    name: "coolant",
    type: "prod",
    req: {
        ice: 10
    },
    category: "production",
    functional: "refining"
});
resources[24] = new Resource({
    id: 24,
    name: "robots",
    type: "prod",
    req: {
        artificial_intelligence: 1,
        halean: 1
    },
    category: "production",
    functional: "construction"
});
resources[25] = new Resource({
    id: 25,
    name: "armor",
    type: "prod",
    req: {
        military: 12
    },
    category: "military",
    functional: "military"
});
resources[26] = new Resource({
    id: 26,
    name: "engine",
    type: "prod",
    req: {
        military: 16
    },
    category: "military",
    functional: "construction"
});
resources[27] = new Resource({
    id: 27,
    name: "empty battery",
    type: "prod",
    req: {
        electronics: 8
    },
    category: "production",
    functional: "energy"
});
resources[28] = new Resource({
    id: 28,
    name: "full battery",
    type: "prod",
    req: {
        electronics: 8
    },
    category: "production",
    functional: "energy"
});
resources[29] = new Resource({
    id: 29,
    name: "u-ammunition",
    type: "prod",
    req: {
        military: 8
    },
    category: "military",
    functional: "military"
});
resources[30] = new Resource({
    id: 30,
    name: "t-ammunition",
    type: "prod",
    req: {
        artofwar: 1
    },
    category: "military",
    functional: "military"
});
resources[31] = new Resource({
    id: 31,
    name: "sulfur",
    req: {
        vulcan: 1
    },
    category: "extraction",
    functional: "refining"
});
resources[32] = new Resource({
    id: 32,
    name: "antimatter",
    type: "prod",
    req: {
        quantum: 1
    },
    category: "production",
    functional: "energy"
});
resources[33] = new Resource({
    id: 33,
    name: "mK Embryo",
    type: "prod",
    req: {
        osmium: 1
    },
    category: "production",
    functional: "construction"
});
resources[34] = new Resource({
    id: 34,
    name: "superconductors",
    type: "prod",
    req: {
        nononono: 15
    },
    category: "production",
    functional: "construction"
});
resources[35] = new Resource({
    id: 35,
    name: "caesium",
    req: {
        karan_nuclear: 1
    },
    category: "extraction",
    functional: "refining"
});
resources[36] = new Resource({
    id: 36,
    name: "thorium",
    req: {
        karan_nuclear: 1
    },
    category: "extraction",
    functional: "energy"
});
resources[37] = new Resource({
    id: 37,
    name: "ammonia",
    req: {
        ammonia_chemistry: 1
    },
    category: "extraction",
    functional: "refining"
});
resources[38] = new Resource({
    id: 38,
    name: "loaded cryocell",
    req: {
        nononono: 2
    },
    category: "production",
    functional: "population"
});
resources[39] = new Resource({
    id: 39,
    name: "dark matter",
    req: {
        nononono: 2
    },
    category: "production",
    functional: "energy"
});
for (var resNum = resources.length, researchNum = 0, highlightRes = Array(resNum), highlightProd = Array(resNum), highlightCons = Array(resNum), r = 0; r < resNum; r++) highlightRes[r] = !1, highlightProd[r] = !1, highlightCons[r] = !1;
for (r = resNum; r < 100 - resNum; r++) resources[r] = new Resource({
    id: r,
    name: "zzzplaceholder",
    type: "prod",
    req: {
        nononono: 3
    }
});
var resourcesPrices = [.01, .1, 4.53, 22307.38, 141.77, 303.03, 8, 1.54, 5E3, 7.28, 28, 5E3, 907.3, 5E3, 66.36, 3.33, 810.26, 5580.62, 43.74, 362.49, 82.93, 73.46, 5E3, 13802.12, 16892.96, 4163.75, 62241.59, .12, 1.2, 1856.36, 22E3, 12989.2, 5E3, 5E5, 5E5, 5E5, 5E5, 5E5, 5E5, 5E5, 5E5, 0];
for (r = 0; r < resources.length; r++) resourcesPrices[r] || (resourcesPrices[r] = 0);
for (r = 0; r < resourcesPrices.length; r++) resourcesPrices[r] /= 10, resources[r].value = 1 / resourcesPrices[r];
resources.energy = new Resource({
    id: "energy",
    name: "energy",
    type: "prod",
    value: 4
});
resources.researchPoint = new Resource({
    id: "research",
    name: "research point",
    type: "prod",
    value: 0
});
for (var i = 0; i < resNum; i++) resources[i].id = i, resourcesName[resources[i].name] = resources[i];
var allEnv = "desert;ice;terrestrial;forest;metallic;ocean;gas giant;lava;carbon;ammonia".split(";"),
    allEnvExt = "desert;ice;terrestrial;forest;metallic;ocean;gas giant;lava;acid;radioactive;carbon;ammonia".split(";"),
    allEnvRadio = "desert;ice;terrestrial;forest;metallic;ocean;gas giant;lava;radioactive;carbon;ammonia".split(";"),
    allEnvAcid = "desert;ice;terrestrial;forest;metallic;ocean;gas giant;lava;acid;carbon;ammonia".split(";"),
    allEnvHot = ["desert", "lava", "acid"],
    allEnvCold = ["ice", "radioactive", "metallic",
"carbon", "ammonia"],
    allEnvTemperate = ["terrestrial", "forest", "ocean"],
    allTer = "desert ice terrestrial forest metallic ocean carbon".split(" ");

function Building(b) {
    this.id = b.id;
    this.name = b.name;
    this.displayName = b.displayName;
    this.description = b.description || "";
    this.resourcesCost = Array(resNum);
    this.resourcesLevel = Array(resNum);
    this.resourcesMult = Array(resNum);
    this.resourcesProd = Array(resNum);
    this.resourcesNeeded = [];
    for (var e = 0; e < resNum; e++) this.resourcesCost[e] = 0, this.resourcesLevel[e] = 0, this.resourcesMult[e] = 0, this.resourcesProd[e] = 0;
    this.researchReq = {};
    this.civis = null;
    b.cost = b.cost || [];
    b.extraCost = b.extraCost || [];
    b.prod = b.prod || [];
    b.mult =
        b.mult || [];
    b.req = b.req || {};
    for (e = 0; e < resNum; e++) this.resourcesCost[e] = b.cost[resources[e].name] || 0;
    for (e = 0; e < resNum; e++) this.resourcesLevel[e] = b.extraCost[resources[e].name] || 0;
    for (e = 0; e < resNum; e++) this.resourcesMult[e] = b.mult[resources[e].name] || 1.2;
    var d = 0;
    for (e = 0; e < resNum; e++) this.resourcesProd[e] = b.prod[resources[e].name] || 0, 0 > this.resourcesProd[e] && (this.resourcesNeeded[d] = e, d++);
    for (var h in b.req) this.researchReq[h] = b.req[h];
    this.moneyCost = b.moneyCost || 0;
    this.habitableSpace = b.space || 0;
    this.energy =
        b.energy || 0;
    this.population = b.population || 0;
    this.money = b.money || 0;
    this.researchPoint = b.researchPoint || 0;
    this.pollution = b.prod.pollution || 0;
    this.icon = b.icon || "void.png";
    this.extra = b.extra || !1;
    this.type = b.type || "other";
    this.type2 = b.type2 || "mine";
    this.environment = b.environment || ["desert", "ice", "terrestrial", "metallic", "carbon"];
    for (e = d = 0; e < resNum; e++) d += this.resourcesProd[e] * resources[e].value;
    d += this.energy * resources.energy.value;
    this.value = b.value || d;
    this.isActive = function (b) {
        return b.structure[this.id].active
    };
    this.showFood = !1;
    this.showRes = function (b) {
        for (var d in this.researchReq)
            if (this.researchReq[d] > civis[this.civis].researches[researchesName[d]].level) return !1;
        return !0
    };
    this.show = function (b) {
        for (var d in this.researchReq)
            if (this.researchReq[d] > civis[this.civis].researches[researchesName[d]].level) return !1;
        if (b) {
            var e = !1;
            for (d = 0; d < this.environment.length; d++) this.environment[d] == b.type && (e = !0);
            if (!e) return !1
        }!this.showFood && 0 < this.resourcesProd[resourcesName.biomass.id] && (1 >= game.planets.length || b.population <
            b.sustainable()) && (this.showFood = !0);
        return !0
    };
    this.rawProduction = function (b, d) {
        var e = [];
        e.energy = this.energy;
        for (var g = 0; g < resNum; g++) e[g] = this.resourcesProd[g] * idleBon;
        if ("mine" == this.type2) {
            for (g = 0; g < resNum; g++) e[g] *= b.baseResources[g];
            e.energy = this.energy
        } else if ("prod" == this.type2) {
            for (g = 0; g < resNum; g++) 1 < b.baseResources[g] && 0 < e[g] && "prod" == resources[g].type && (e[g] *= b.baseResources[g]);
            e.energy = this.energy
        }
        e.researchPoint = this.researchPoint * idleBon;
        "cryolab" == this.name && (e.researchPoint = 5 * e.researchPoint *
            -b.info.temp);
        "lavaresearch" == this.name && (e.researchPoint *= b.info.temp);
        e.population = this.population * idleBon;
        e.pollution = this.pollution;
        return e
    };
    this.rprod = [];
    this.production = function (b) {
        var d = [],
            e = b.energyMalus();
        0 <= this.energy && (e = 1);
        for (var g = 0; g < resNum; g++) d[g] = 0, this.rprod[g] = 0;
        d.researchPoint = 0;
        d.population = 0;
        d.pollution = 0;
        this.rprod.researchPoint = 0;
        this.rprod.population = 0;
        this.rprod.pollution = 0;
        if (b.structure[this.id].active)
            if ("mine" == this.type2) {
                var h = 1,
                    C;
                for (C in b.fleets) g = b.fleets[C].ships[73],
                    h += .2 * Math.log(2) * g / Math.log(2 + g);
                for (g = 0; g < resNum; g++) d[g] = this.resourcesProd[g] * b.baseResources[g] * e * h, this.rprod[g] = d[g]
            } else if ("prod" == this.type2) {
            h = !1;
            for (g = 0; g < resNum; g++) 0 > b.resources[g] + b.structure[this.id].number * this.resourcesProd[g] ? (h = !0, b.globalNoRes[this.id][g] = !0) : b.globalNoRes[this.id][g] = !1;
            if (h) {
                for (g = 0; g < resNum; g++) this.rprod[g] = this.resourcesProd[g] * e, 1 < b.baseResources[g] && 0 < d[g] && "prod" == resources[g].type && (this.rprod[g] *= b.baseResources[g]);
                this.rprod.researchPoint = this.researchPoint *
                    e;
                this.rprod.population = this.population * e
            } else {
                for (g = 0; g < resNum; g++) d[g] = this.resourcesProd[g] * e, 1 < b.baseResources[g] && 0 < d[g] && "prod" == resources[g].type && (d[g] *= b.baseResources[g]), this.rprod[g] = d[g];
                d.researchPoint = this.researchPoint * e;
                d.population = this.population * e;
                this.rprod.researchPoint = d.researchPoint;
                this.rprod.population = d.population
            }
        }
        for (g = 0; g < resNum; g++) d[g] = d[g] * b.structure[this.id].number * idleBon, this.rprod[g] = this.rprod[g] * b.structure[this.id].number * idleBon;
        d.researchPoint = d.researchPoint *
            b.structure[this.id].number * idleBon;
        "cryolab" == this.name && (d.researchPoint = 5 * d.researchPoint * -b.info.temp);
        "lavaresearch" == this.name && (d.researchPoint *= b.info.temp);
        d.population = d.population * b.structure[this.id].number * idleBon;
        d.pollution = b.structure[this.id].number * this.pollution * e - b.pollutionRate;
        d.energy = this.energyUsage(b);
        this.rprod.researchPoint = this.rprod.researchPoint * b.structure[this.id].number * idleBon;
        "cryolab" == this.name && (this.rprod.researchPoint = 5 * this.rprod.researchPoint * -b.info.temp);
        "lavaresearch" == this.name && (this.rprod.researchPoint *= b.info.temp);
        this.rprod.population = this.rprod.population * b.structure[this.id].number * idleBon;
        this.rprod.pollution = d.pollution;
        this.rprod.energy = d.energy;
        return d
    };
    this.energyUsage = function (b) {
        var d = 0;
        if (b.structure[this.id].active)
            if ("solar" == this.type2) d = this.energy / (b.info.orbit * b.info.orbit);
            else if ("prod" == this.type2 || "mine" == this.type2) {
            for (var e = !1, g = 0; g < this.resourcesNeeded.length; g++) {
                var h = this.resourcesNeeded[g];
                if (0 > b.resources[h] + b.structure[this.id].number *
                    this.resourcesProd[h]) {
                    e = !0;
                    break
                }
            }
            e || (d = this.energy)
        }
        return d *= b.structure[this.id].number
    };
    this.produce = function (b, d) {
        if (b.structure[this.id].active) {
            for (var e = this.production(b), g = 0; g < resNum; g++) b.resourcesAdd(g, e[g] / d);
            null != b.civis && (civis[b.civis].researchPoint += e.researchPoint / d);
            b.populationAdd(e.population / d);
            b.pollutionAdd(e.pollution / d)
        }
    }
}

function buildingLoader(b, e) {
    b.civis = e.civis;
    b.active = e.active
}

function buildingSaver(b) {
    var e = {};
    e.civis = b.civis;
    e.active = b.active;
    return e
}

function PlanetBuilding(b, e, d, h) {
    this.building = e;
    this.number = d;
    this.planet = b;
    this.active = h || !0;
    this.setActive = function (b) {
        this.active = b
    };
    this.cost = function (b) {
        if (null != planets[this.planet].civis) {
            var d = civis[planets[this.planet].civis].buildings[this.building];
            return Math.floor(d.resourcesCost[b] * Math.pow(d.resourcesMult[b], this.number))
        }
        return 0
    };
    this.totalCost = function (b) {
        for (var d = Array(resNum), e = 0; e < resNum; e++) d[e] = 0;
        if (null != planets[this.planet].civis) {
            e = civis[planets[this.planet].civis].buildings[this.building];
            for (var g = 0; g < b; g++)
                for (var h = 0; h < resNum; h++) d[h] += Math.floor(e.resourcesCost[h] * Math.pow(e.resourcesMult[h], this.number + g))
        }
        return d
    };
    this.totalCostQueue = function (b) {
        var d = 0;
        for (e in planets[this.planet].queue)
            if (planets[this.planet].queue[e].b == this.building) {
                d = planets[this.planet].queue[e].n;
                break
            }
        var e = Array(resNum);
        for (var g = 0; g < resNum; g++) e[g] = 0;
        if (null != planets[this.planet].civis) {
            g = civis[planets[this.planet].civis].buildings[this.building];
            for (var h = 0; h < resNum; h++) 0 < g.resourcesCost[h] && (e[h] =
                Math.floor((Math.pow(g.resourcesMult[h], this.number + d + b) - Math.pow(g.resourcesMult[h], this.number + d)) / (g.resourcesMult[h] - 1) * g.resourcesCost[h]))
        }
        return e
    };
    this.showCost = function (b, d) {
        if (null != planets[this.planet].civis) {
            var e = civis[planets[this.planet].civis].buildings[this.building];
            return Math.floor(e.resourcesCost[b] * Math.pow(e.resourcesMult[b], d))
        }
        return 0
    };
    this.value = function () {
        for (var b = 0, d = 0; d < resNum; d++) b += this.cost(d) * resources[d].value;
        return buildings[this.building].value / b
    }
}

function PlanetBuilder(b, e, d, h, g, l) {
    return new Planet({
        id: b,
        name: e,
        resources: {
            iron: d,
            hydrogen: h
        },
        icon: g,
        pos: l
    })
}

function StationPiece(b) {
    this.id = b.id;
    this.name = b.name;
    this.requirement = b.requirement || function () {
        return !0
    };
    this.available = function () {
        return this.requirement() ? !0 : !1
    }
}

function Planet(b) {
    this.id = b.id;
    this.name = b.name;
    this.civis = null;
    this.type = b.type || "Planet";
    this.unlock = b.unlock || null;
    this.artifact = b.artifact || 0;
    this.influence = b.influence || 1;
    this.station = [];
    this.map = 0;
    this.queue = {};
    this.places = [];
    this.compactQueue = function () {
        var b = 0,
            e;
        for (e in this.queue) b++;
        for (e = 0; e < b; e++)
            if (!this.queue[e]) {
                for (var g = e + 1; !this.queue[g] && 1E3 > g;) g++;
                this.queue[e] = this.queue[g];
                delete this.queue[g]
            }
    };
    this.onConquer = b.onConquer || function () {};
    this.history = "";
    this.routes = [];
    this.shortestPath = [];
    b.res = b.res || [];
    b.baseRes = b.baseRes || [];
    this.resources = Array(resNum);
    this.resourcesRequest = Array(resNum);
    this.baseResources = Array(resNum);
    for (var e = 0; e < resNum; e++) this.resources[e] = 0, this.resourcesRequest[e] = 0, this.baseResources[e] = 0;
    for (e = 0; e < resNum; e++) this.baseResources[e] = "ore" == resources[e].type ? b.baseRes[resources[e].name] || 0 : b.baseRes[resources[e].name] || 1;
    this.population = this.energy = 0;
    this.basePopulation = b.baseRes.population || 0;
    this.populationDecay = b.populationDecay || .01;
    this.pollution =
        0;
    this.pollutionRate = b.baseRes.pollution || 1;
    this.structure = [];
    this.icon = b.icon || "void.png";
    this.info = b.info || new PlanetInfo(0, 0, "", 0, []);
    this.civis = null;
    this.x = b.pos[0] || 0;
    this.y = b.pos[1] || 0;
    this.bombsDropped = 0;
    this.fleets = {};
    this.fleetPush = function (b) {
        for (var d = 0; null != this.fleets[d];) d++;
        this.fleets[d] = b
    };
    this.raid = function (b) {};
    this.changeTemp = function (b) {
        "ocean" == this.type ? 1 > this.info.temp ? this.type = "ice" : 99 < this.info.temp && (this.type = "desert") : "ice" == this.type ? 0 < this.info.temp && (this.type = "ocean") :
            "desert" == this.type ? 800 <= this.info.temp && (this.type = "lava") : "lava" == this.type ? 800 > this.info.temp && (this.type = "desert") : "terrestrial" == this.type ? 80 < this.info.temp && (this.type = "desert") : "terrestrial" == this.type && -30 > this.info.temp && (this.type = "ice");
        this.info.temp += b;
        if (10 > this.info.temp && 0 > b) {
            var d = .1 * this.baseResources[resourcesName.water.id] * b * Math.pow(1.121, 10 - this.info.temp);
            this.baseResources[resourcesName.water.id] += d;
            this.baseResources[resourcesName.ice.id] -= d;
            0 > this.baseResources[resourcesName.water.id] &&
                (this.baseResources[resourcesName.water.id] = 0);
            0 > this.baseResources[resourcesName.ice.id] && (this.baseResources[resourcesName.ice.id] = 0)
        } else 0 <= this.info.temp && 30 >= this.info.temp && 0 < b ? (d = .08 * this.baseResources[resourcesName.ice.id] * b * Math.pow(1.08, this.info.temp), this.baseResources[resourcesName.ice.id] -= d, this.baseResources[resourcesName.water.id] += d, 0 > this.baseResources[resourcesName.water.id] && (this.baseResources[resourcesName.water.id] = 0), 0 > this.baseResources[resourcesName.ice.id] && (this.baseResources[resourcesName.ice.id] =
            0)) : 90 <= this.info.temp && 0 < b && (d = .1 * this.baseResources[resourcesName.water.id] * b * Math.pow(1.08, this.info.temp - 90), this.baseResources[resourcesName.water.id] -= d, 0 > this.baseResources[resourcesName.water.id] && (this.baseResources[resourcesName.water.id] = 0), d = .1 * this.baseResources[resourcesName.ice.id] * b * Math.pow(1.08, this.info.temp - 90), this.baseResources[resourcesName.ice.id] -= d, 0 > this.baseResources[resourcesName.ice.id] && (this.baseResources[resourcesName.ice.id] = 0))
    };
    this.destroyIncompatible = function () {};
    this.setCivis = function (b) {
        this.civis = b;
        civis[b].pushPlanet(this.id)
    };
    this.resourcesAdd = function (b, e) {
        var d = e;
        isNaN(d) && (d = 0);
        this.resources[b] += d;
        0 > this.resources[b] && (this.resources[b] = 0);
        0 < this.resourcesRequest[b] && (this.resourcesRequest[b] -= d);
        0 > this.resourcesRequest[b] && (this.resourcesRequest[b] = 0)
    };
    this.populationAdd = function (b) {
        isNaN(b) && (b = 0);
        this.population += b;
        0 > this.population && (this.population = 0);
        this.population > this.habitableSpace() && (this.population = this.habitableSpace());
        isNaN(this.population) &&
            (this.population = 1E3 * this.basePopulation)
    };
    this.pollutionAdd = function (b) {
        this.pollution += b;
        0 > this.pollution && (this.pollution = 0)
    };
    this.habitableSpace = function () {
        for (var b = this.sustainable(), e = 0; e < this.structure.length; e++) b += buildings[e].habitableSpace * this.structure[e].number;
        return Math.max(Math.min(this.maxPopulation, b), 0)
    };
    this.maxPopulation = 400 * this.info.radius * this.info.radius;
    this.sustainable = function () {
        return (1 + 10 * this.basePopulation) * this.info.radius * this.baseResources[resourcesName.biomass.id]
    };
    this.populationRatio = 0;
    this.growPopulation = function (b) {
        b = b * idleBon || 1;
        var d = 0;
        if (gameSettings.populationEnabled) {
            if (this.population < this.sustainable()) d = this.population * (this.basePopulation + .01 * this.structure[buildingsName.clonation].number) / 360;
            else if (0 < this.resources[resourcesName.biomass.id]) {
                d = this.population * (this.basePopulation + .01 * this.structure[buildingsName.clonation].number) / 360;
                var e = (this.population - this.sustainable()) / 5E3 * b;
                0 > e && (e = 0);
                this.resources[resourcesName.biomass.id] < e && (d = .01 *
                    -this.population);
                this.resourcesAdd(resourcesName.biomass.id, -e)
            } else d = .01 * -this.population / 360;
            this.populationAdd(d * b)
        }
        return this.populationRatio = d
    };
    this.energyMalus = function () {
        var b = 1;
        0 != this.energyConsumption() && (b = this.energyProduction() / -this.energyConsumption());
        1 < b && (b = 1);
        0 > b && (b = 0);
        return b
    };
    this.lastCheck = this.lastTime = (new Date).getTime();
    this.lastRes = Array(resNum);
    this.lastRes2 = Array(resNum);
    this.lastProd = Array(resNum);
    this.lastProd2 = Array(resNum);
    this.globalProd = Array(resNum);
    this.globalRaw =
        Array(resNum);
    this.globalImpExpProd = Array(resNum);
    this.globalImport = Array(resNum);
    this.globalExport = Array(resNum);
    this.globalNoRes = [];
    for (e = 0; e < resNum; e++) this.lastRes[e] = 0, this.lastRes2[e] = 0, this.lastProd[e] = 0, this.lastProd2[e] = 0, this.globalProd[e] = 0, this.globalRaw[e] = 0, this.globalImpExpProd[e] = 0, this.globalImport[e] = 0, this.globalExport[e] = 0;
    this.globalProd.researchPoint = 0;
    this.globalProd.population = 0;
    this.lastRes.population = 0;
    this.lastRes.pollution = 0;
    this.lastRes.researchPoint = 0;
    this.lastVolte =
        12;
    this.lastCheck2 = this.lastTime;
    this.removeRequest = function (b, e) {
        for (var d = this.structure[b].totalCost(e), h = 0; h < resNum; h++) this.resourcesRequest[h] -= d[h], 0 > this.resourcesRequest[h] && (this.resourcesRequest[h] = 0)
    };
    this.addRequest = function (b, e, g) {
        b = g ? this.structure[b].totalCostQueue(e) : this.structure[b].totalCost(e);
        e = [];
        for (g = 0; g < resNum; g++) e[g] = 0;
        for (var d in this.queue)
            if (this.queue[d]) {
                var h = this.structure[this.queue[d].b].totalCost(this.queue[d].n);
                for (g = 0; g < resNum; g++) e[g] += Math.floor(h[g])
            }
        for (d =
            0; d < resNum; d++) b[d] = Math.max(b[d] - Math.max(Math.floor(this.resources[d]) - e[d], 0), 0), 0 < b[d] && (this.resourcesRequest[d] += Math.ceil(b[d]))
    };
    this.removeQueue = function (b) {
        for (var d in this.queue)
            if (this.queue[d].b == b) {
                this.removeRequest(b, this.queue[d].n);
                delete this.queue[d];
                break
            }
    };
    this.addQueue = function (b, e) {
        var d = !1,
            h;
        for (h in this.queue)
            if (this.queue[h].b == b) {
                d = !0;
                this.addRequest(b, e, !0);
                this.queue[h].n += e;
                break
            }
        if (!d) {
            for (d = 0; this.queue[d];) d++;
            this.addRequest(b, e, !1);
            this.queue[d] = {
                b: b,
                n: e,
                q: e
            }
        }
        buildQueue()
    };
    this.rawProduction = function () {
        return this.globalProd
    };
    this.structureAffordable = function (b) {
        for (var d in buildings[b].researchReq)
            if (civis[this.civis].buildings[b].researchReq[d] > researchesName[d].level) return !1;
        for (d = 0; d < resNum; d++)
            if (this.structure[b].cost(d) > this.resources[d]) return !1;
        return !0
    };
    this.structureAffordablePct = function (b, e) {
        for (var d in buildings[b].researchReq)
            if (civis[this.civis].buildings[b].researchReq[d] > researchesName[d].level) return !1;
        for (d = 0; d < resNum; d++)
            if (this.structure[b].cost(d) *
                e > this.resources[d]) return !1;
        return !0
    };
    this.buyStructure = function (b) {
        if (this.structureAffordable(b)) {
            for (var d = 0; d < resNum; d++) this.resourcesAdd(d, -this.structure[b].cost(d)), this.lastRes[d] -= this.structure[b].cost(d);
            this.structure[b].number += 1;
            return !0
        }
        return !1
    };
    this.buyMultipleStructure = function (b, e, g) {
        var d = !1;
        if (this.structureAffordable(b)) {
            for (var h = Array(resNum), t = 0; t < h.length; t++) h[t] = 0;
            if (null != planets[this.id].civis) {
                d = civis[planets[this.id].civis].buildings[b];
                for (var x = 0; x < e; x++)
                    for (t =
                        0; t < resNum; t++) h[t] += Math.floor(d.resourcesCost[t] * Math.pow(d.resourcesMult[t], this.structure[b].number + x))
            }
            d = !0;
            for (t = 0; t < resNum; t++)
                if (h[t] > this.resources[t]) {
                    d = !1;
                    break
                }
            if (d) {
                for (x = 0; x < e; x++) {
                    for (t = 0; t < resNum; t++) this.resourcesAdd(t, -this.structure[b].cost(t)), this.lastRes[t] -= this.structure[b].cost(t);
                    this.structure[b].number += 1
                }
                return !0
            }
        }
        if (gameSettings.useQueue && !d && !g && (0 < game.timeTravelNum || 1 < game.planets.length)) this.addQueue(b, e);
        else return d
    };
    this.sellStructure = function (b) {
        if (0 < this.structure[b].number) {
            this.structure[b].number--;
            for (var d = 0; d < resNum; d++) this.resourcesAdd(d, this.structure[b].cost(d) / 2), this.lastRes[d] += this.structure[b].cost(d) / 2;
            return !0
        }
        return !1
    };
    this.sellMultipleStructure = function (b, e) {
        if (this.structure[b].number >= e) {
            for (var d = 0; d < e; d++) {
                this.structure[b].number--;
                for (var h = 0; h < resNum; h++) this.resourcesAdd(h, this.structure[b].cost(h) / 2), this.lastRes[h] += this.structure[b].cost(h) / 2
            }
            return !0
        }
        return !1
    };
    this.showSellCost = function (b, e) {
        if (this.structure[b].number >= e) {
            for (var d = "<span class='blue_text'>You get 50% of the cost back:</span>",
                    h = Array(resNum), m = 0; m < h.length; m++) h[m] = 0;
            for (var t = 0; t < e; t++)
                for (m = 0; m < resNum; m++) h[m] += this.structure[b].showCost(m, this.structure[b].number - t - 1);
            for (m = 0; m < resNum; m++) 0 < h[m] && (d += "<br><span class='blue_text'>" + resources[m].name.capitalize() + ": </span><span class='white_text'>" + beauty(Math.floor(h[m] / 2)) + "</span>");
            return d
        }
        return "<span class='red_text red_text_shadow'>You don't have " + e + " buildings</span>"
    };
    this.showBuyCost = function (b, e) {
        for (var d = "<span class='blue_text'>Total cost for " + e + " buildings:</span>",
                h = Array(resNum), m = 0; m < h.length; m++) h[m] = 0;
        for (var t = 0; t < e; t++)
            for (m = 0; m < resNum; m++) h[m] += this.structure[b].showCost(m, this.structure[b].number + t);
        for (m = 0; m < resNum; m++) 0 < h[m] && (d = this.resources[m] < h[m] ? d + ("<br><span class='red_text'>" + resources[m].name.capitalize() + ": " + beauty(h[m]) + "</span>") : d + ("<br><span class='blue_text'>" + resources[m].name.capitalize() + ": </span><span class='white_text'>" + beauty(h[m]) + "</span>"));
        return d
    };
    this.shipAffordable = function (b) {
        for (var d = 0; d < resNum; d++)
            if (ships[b].cost[d] >
                this.resources[d]) return !1;
        return this.population < ships[b].population ? !1 : !0
    };
    this.buyShip = function (b) {
        if (this.shipAffordable(b) && this.shipyardFleet) {
            for (var d = 0; d < resNum; d++) this.resourcesAdd(d, -ships[b].cost[d]), this.lastRes[d] -= ships[b].cost[d];
            this.populationAdd(-ships[b].population);
            this.shipyardFleet.ships[b] += 1;
            this.shipyardFleet.name = this.shipyardFleet.fleetType() + " Y" + Math.floor(game.days / 365) + "-D" + Math.floor(game.days % 365);
            return !0
        }
        return !1
    };
    this.sellShip = function (b) {
        if (this.shipyardFleet &&
            0 < this.shipyardFleet.ships[b]) {
            this.shipyardFleet.ships[b]--;
            this.shipyardFleet.name = this.shipyardFleet.fleetType() + " Y" + Math.floor(game.days / 365) + "-D" + Math.floor(game.days % 365);
            for (var d = 0; d < resNum; d++) this.resourcesAdd(d, ships[b].cost[d] / 2), this.lastRes[d] += ships[b].cost[d] / 2;
            return !0
        }
        return !1
    };
    this.buyMultipleShip = function (b, e) {
        if (this.shipAffordable(b) && this.shipyardFleet) {
            for (var d = Array(resNum), h = 0; h < resNum; h++) d[h] = ships[b].cost[h] * e;
            for (h = 0; h < resNum; h++)
                if (d[h] > this.resources[h]) return !1;
            for (h = 0; h < resNum; h++) this.resourcesAdd(h, -d[h]), this.lastRes[h] -= d[h];
            this.shipyardFleet.ships[b] += e;
            this.shipyardFleet.name = this.shipyardFleet.fleetType() + " Y" + Math.floor(game.days / 365) + "-D" + Math.floor(game.days % 365);
            return !0
        }
        return !1
    };
    this.maxMultipleShip = function (b) {
        if (this.shipAffordable(b) && this.shipyardFleet) {
            for (var d = 1E100, e = 0; e < resNum; e++)
                if (0 < ships[b].cost[e]) {
                    var l = this.resources[e] / ships[b].cost[e];
                    l < d && (d = l)
                }
            return d
        }
        return 0
    };
    this.showBuyShipCost = function (b, e) {
        if (this.shipyardFleet) {
            for (var d =
                    "<span class='blue_text'>Total cost for " + e + " spaceships:</span>", h = Array(resNum), m = 0; m < resNum; m++) h[m] = ships[b].cost[m] * e;
            for (m = 0; m < resNum; m++) 0 < h[m] && (d = this.resources[m] < h[m] ? d + ("<br><span class='red_text'>" + resources[m].name.capitalize() + ": </span><span class='white_text'>" + beauty(h[m]) + "</span>") : d + ("<br><span class='blue_text'>" + resources[m].name.capitalize() + ": </span><span class='white_text'>" + beauty(h[m]) + "</span>"));
            return d
        }
        return "<span class='red_text'>Ops #1!</span>"
    };
    this.showSellShipCost =
        function (b, e) {
            if (this.shipyardFleet) {
                for (var d = "<span class='blue_text'>You get 100% of the cost back:</span>", h = Array(resNum), m = 0; m < resNum; m++) h[m] = ships[b].cost[m] * e;
                if (this.shipyardFleet.ships[b] >= e) {
                    for (m = 0; m < resNum; m++) 0 < h[m] && (d += "<br><span class='blue_text'>" + resources[m].name.capitalize() + ": </span><span class='white_text'>" + beauty(h[m]) + "</span>");
                    return d
                }
                return "<span class='red_text'>You don't have " + e + " space ships</span>"
            }
            return "<span class='red_text'>Ops #2!</span>"
        };
    this.sellMultipleShip =
        function (b, e) {
            if (this.shipyardFleet && this.shipyardFleet.ships[b] >= e) {
                this.shipyardFleet.ships[b] -= e;
                this.shipyardFleet.name = this.shipyardFleet.fleetType() + " Y" + Math.floor(game.days / 365) + "-D" + Math.floor(game.days % 365);
                for (var d = 0; d < resNum; d++) this.resourcesAdd(d, ships[b].cost[d] * e), this.lastRes[d] += ships[b].cost[d] * e;
                return !0
            }
            return !1
        };
    this.energyProduction = function () {
        var b = 0;
        if (null != this.civis)
            for (var e = 0; e < energyBuildings.length; e++) {
                var g = civis[this.civis].buildings[energyBuildings[e]].energyUsage(this);
                b += g
            }
        return b
    };
    this.energyConsumption = function () {
        var b = 0;
        if (null != this.civis)
            for (var e = 0; e < unenergyBuildings.length; e++) b += civis[this.civis].buildings[unenergyBuildings[e]].energyUsage(this);
        return b
    };
    this.produce = function (b) {
        for (var d = 0; d < this.globalProd.length; d++) this.globalProd[d] = 0, this.globalRaw[d] = 0;
        this.globalProd.researchPoint = 0;
        this.globalProd.population = 0;
        this.globalRaw.researchPoint = 0;
        for (d = this.globalRaw.population = 0; d < this.structure.length; d++)
            if (0 < this.structure[d].number && this.structure[d].active) {
                for (var e =
                        game.buildings[d].production(this), l = game.buildings[d].rprod, m = 0; m < resNum; m++) this.globalProd[m] += e[m], this.globalRaw[m] += Math.min(e[m], l[m]);
                this.globalProd.researchPoint += e.researchPoint;
                this.globalProd.population += e.population;
                this.globalRaw.researchPoint += l.researchPoint;
                this.globalRaw.population += l.population
            }
        for (m = 0; m < resNum; m++) this.resourcesAdd(m, this.globalProd[m] * b);
        this.populationAdd(this.globalProd.population * b);
        for (d = 0; d < this.globalProd.length; d++) this.globalImpExpProd[d] = this.globalProd[d] +
            this.globalImport[d] - this.globalExport[d]
    };
    this.importExport = function () {
        for (var b = Array(resNum), e = Array(resNum), g = Array(planets.length), l = 0; l < resNum; l++) b[l] = 0, e[l] = 0;
        for (var m = 0; m < planets.length; m++)
            for (g[m] = Array(resNum), l = 0; l < resNum; l++) g[m][l] = 0;
        g = fleetSchedule.civisFleet(game.id);
        for (m = 0; m < g.length; m++)
            if (g[m] && "auto" == g[m].type) {
                var t = fleetSchedule.fleets[g[m].fleet],
                    x = parseInt(Math.floor(2 * planets[g[m].origin].shortestPath[g[m].destination].distance / t.speed()));
                if (g[m].origin == this.id || g[m].destination ==
                    this.id) {
                    var C = g[m].origin == this.id ? g[m].destination : g[m].origin;
                    for (l = 0; l < resNum; l++) {
                        var E = 1 - t.autoMap[this.id];
                        t.autoRes[t.autoMap[this.id]] && t.autoRes[t.autoMap[C]] && (t.autoPct[l] ? (0 < this.globalProd[l] && (e[l] += this.globalProd[l] * t.autoRes[t.autoMap[this.id]][l] / 1E4), 0 >= planets[C].globalProd[l] && (e[l] += -(planets[C].globalProd[l] * t.autoRes[t.autoMap[C]][l] / 1E4))) : e[l] += t.autoRes[t.autoMap[this.id]][l] / x * idleBon, t.autoPct[l] ? (0 >= this.globalProd[l] && (b[l] += -(this.globalProd[l] * t.autoRes[t.autoMap[this.id]][l] /
                            1E4)), 0 < planets[C].globalProd[l] && (b[l] += planets[C].globalProd[l] * t.autoRes[t.autoMap[C]][l] / 1E4)) : b[l] += t.autoRes[E][l] / x * idleBon)
                    }
                }
            }
        this.globalImport = b;
        this.globalExport = e
    }
}

function settingsLoader(b) {
    for (var e in gameSettings) gameSettings[e] = b[e] || gameSettingsReset[e] || !1;
    gameSettings.civis || (gameSettings.civis = "0")
}

function planetLoader30(b, e) {
    for (var d = 0; d < resNum; d++) b.resources[d] = e.resources[d] ? e.resources[d] : 0, b.resourcesRequest[d] = e.resourcesRequest && e.resourcesRequest[d] ? e.resourcesRequest[d] : 0;
    b.queue = e.q || {};
    b.energy = e.energy;
    b.population = e.pop || 0;
    $.isNumeric(b.population) || (b.population = b.sustainable());
    b.structure = [];
    for (d = 0; d < buildings.length; d++) e.structure[d] ? e.structure[d].n ? (b.structure[d] = new PlanetBuilding(b.id, d, e.structure[d].n), e.structure[d].a && (b.structure[d].active = !1)) : e.structure[d].number ?
        (b.structure[d] = new PlanetBuilding(b.id, d, e.structure[d].number), b.structure[d].active = e.structure[d].active) : b.structure[d] = new PlanetBuilding(b.id, d, 0) : b.structure[d] = new PlanetBuilding(b.id, d, 0);
    b.civis = e.civis;
    var h = b.fleets;
    b.fleets = {};
    var g = e.f || e.fleets;
    for (d in g)
        if (g[d] && !isNaN(parseInt(d))) {
            var l = 1;
            h[d] && h[d].originalStrength && (l = h[d].originalStrength);
            b.fleets[d] = new Fleet(b.civis, "");
            fleetLoader(b.fleets[d], g[d]);
            b.fleets[d].originalStrength = l
        }
    b.fleets.hub = new Fleet(b.civis, "hub");
    e.hf &&
        fleetLoader(b.fleets.hub, e.hf)
}

function planetLoader(b, e) {
    b.energy = e.e || e.energy;
    b.population = e.p || e.population;
    $.isNumeric(b.population) || (b.population = b.sustainable());
    b.queue = e.q || {};
    for (var d = e.r || e.resources, h = e.rq || e.resourcesRequest || {}, g = 0; g < resNum; g++) b.resources[g] = d[g] ? d[g] : 0, b.resourcesRequest[g] = h[g] ? h[g] : 0;
    d = e.s || e.structure;
    for (g = 0; g < buildings.length; g++) d[g] ? parseInt(d[g]) ? (b.structure[g].number = d[g], b.structure[g].active = !0) : d[g].a ? (b.structure[g].number = d[g].n, b.structure[g].active = !1) : b.structure[g].number = d[g].n :
        (b.structure[g].number = 0, b.structure[g].active = !0);
    isFinite(e.c) ? b.civis = e.c : isFinite(e.civis) ? b.civis = e.civis : b.civis = null;
    d = e.f || e.fleets;
    h = b.fleets;
    b.fleets = {};
    for (g in d)
        if (d[g] && !isNaN(parseInt(g))) {
            var l = 1;
            h[g] && h[g].originalStrength && (l = h[g].originalStrength);
            b.fleets[g] = new Fleet(b.civis, "");
            fleetLoader(b.fleets[g], d[g]);
            b.fleets[g].originalStrength = l
        }
    b.fleets[0] = new Fleet(b.civis, b.name + " Shipyard Fleet");
    b.fleets.hub = new Fleet(b.civis, "hub");
    e.hf && fleetLoader(b.fleets.hub, e.hf)
}

function planetSaver30(b) {
    var e = {};
    e.id = b.id;
    e.name = b.name;
    e.type = b.type;
    e.resources = [];
    e.resourcesRequest = [];
    b.compactQueue();
    e.q = b.queue;
    for (var d = 0; d < resources.length; d++) e.resources[d] = b.resources[d], e.resourcesRequest[d] = b.resourcesRequest[d];
    e.energy = b.energy;
    e.pop = b.population;
    e.structure = [];
    for (d = 0; d < buildings.length; d++) b.structure[d] && 0 < b.structure[d].number && (e.structure[d] = {}, e.structure[d].n = b.structure[d].number, b.structure[d].active || (e.structure[d].a = 1));
    e.civis = b.civis;
    e.fleets = [];
    for (d in b.fleets) e.fleets[d] = $.extend(!0, new Fleet(b.civis), b.fleets[d]);
    return e
}

function planetSaver(b) {
    var e = {};
    e.i = b.id;
    e.n = b.name;
    e.t = b.type;
    b.compactQueue();
    e.q = b.queue;
    e.r = {};
    e.rq = {};
    for (var d = 0; d < resNum; d++) 0 < b.resources[d] && (e.r[d] = Math.floor(b.resources[d])), 0 < b.resourcesRequest[d] && (e.rq[d] = Math.floor(b.resourcesRequest[d]));
    e.e = b.energy;
    e.p = b.population;
    e.s = {};
    for (d = 0; d < buildings.length; d++) b.structure[d] && (b.structure[d].active ? 0 < b.structure[d].number && (e.s[d] = b.structure[d].number) : 0 < b.structure[d].number && (e.s[d] = {}, e.s[d].n = b.structure[d].number, e.s[d].a = 1));
    e.c =
        b.civis;
    e.f = {};
    e.hf = fleetSaver(b.fleets.hub, "slim");
    for (d in b.fleets) b.fleets[d] && !isNaN(parseInt(d)) && 0 != parseInt(d) && (e.f[d] = fleetSaver(b.fleets[d], "slim"));
    return e
}

function planetSaver33(b) {
    var e = {};
    e.i = b.id;
    e.n = b.name;
    e.t = b.type;
    b.compactQueue();
    e.q = b.queue;
    e.r = {};
    e.rq = {};
    for (var d = 0; d < resNum; d++) 0 < b.resources[d] && (e.r[d] = parseInt(Math.floor(b.resources[d])).toString(36)), 0 < b.resourcesRequest[d] && (e.rq[d] = parseInt(Math.floor(b.resourcesRequest[d])).toString(36));
    e.e = b.energy;
    e.p = b.population;
    e.s = {};
    for (d = 0; d < buildings.length; d++) b.structure[d] && (b.structure[d].active ? 0 < b.structure[d].number && (e.s[d] = b.structure[d].number) : 0 < b.structure[d].number && (e.s[d] = {},
        e.s[d].n = b.structure[d].number, e.s[d].a = 1));
    e.c = b.civis;
    e.f = {};
    e.hf = fleetSaver(b.fleets.hub, "slim");
    for (d in b.fleets) b.fleets[d] && !isNaN(parseInt(d)) && 0 != parseInt(d) && (e.f[d] = fleetSaver(b.fleets[d], "slim"));
    return e
}

function fleetSaver(b, e) {
    var d = {};
    d.n = b.name;
    d.c = b.civis;
    d.t = b.type;
    d.e = b.exp;
    if ("slim" != e) {
        d.at = Math.floor(b.arrivalTime);
        d.dt = Math.floor(b.departureTime);
        d.tt = Math.floor(b.totalTime);
        d.des = b.destination;
        d.o = b.origin;
        d.s = b.source;
        d.lp = b.lastPlanet;
        d.np = b.nextPlanet;
        d.r = b.route;
        d.h = b.hop;
        d.am = {};
        for (var h = 0; h < b.autoMap.length; h++) null != b.autoMap[h] && (d.am[h] = b.autoMap[h]);
        d.ar = {};
        for (h = 0; 2 > h; h++) {
            for (var g = {}, l = 0; l < resNum; l++) 0 < b.autoRes[h][l] && (g[l] = b.autoPct[l] ? {
                r: b.autoRes[h][l]
            } : b.autoRes[h][l]);
            d.ar[h] = g
        }
    }
    d.sh = {};
    for (h = 0; h < ships.length; h++) 0 < b.ships[h] && (d.sh[h] = b.ships[h]);
    d.st = {};
    for (h = 0; h < resNum; h++) 0 < b.storage[h] && (d.st[h] = Math.floor(b.storage[h]));
    return d
}

function fleetLoader(b, e) {
    b.name = e.n || e.name || "Fleet";
    isFinite(e.c) ? b.civis = e.c : isFinite(e.civis) ? b.civis = e.civis : b.civis = null;
    b.type = e.t || e.type;
    b.arrivalTime = e.at || e.arrivalTime || 0;
    b.departureTime = e.dt || e.departureTime || 0;
    b.totalTime = e.tt || e.totalTime || 0;
    b.destination = e.des || e.destination || 0;
    b.origin = e.o || e.origin || 0;
    b.source = e.s || e.source || 0;
    b.lastPlanet = e.lp || e.lastPlanet || 0;
    b.nextPlanet = e.np || e.nextPlanet || 0;
    b.route = e.r || e.route || 0;
    b.hop = e.h || e.hop || 0;
    b.exp = e.e || e.exp || 0;
    for (var d = e.am || e.autoMap || [], h = 0; h < planets.length; h++) isFinite(d[h]) ? b.autoMap[h] = d[h] : b.autoMap[h] = null;
    h = e.ar || e.autoRes || {};
    if (h[0] && h[1])
        for (d = 0; d < resNum; d++)
            for (var g = 0; 2 > g; g++) h[g][d] && (isNaN(parseInt(h[g][d])) ? (b.autoPct[d] = !0, b.autoRes[d] = h[g][d].r || 0) : b.autoRes[d] = h[g][d]);
    h = e.sh || e.ships || [];
    for (d = 0; d < ships.length; d++) h[d] && (b.ships[d] = h[d]);
    h = e.st || e.storage || [];
    for (d = 0; d < resNum; d++) 0 < h[d] && (b.storage[d] = h[d])
}

function planetArraySaver(b) {
    for (var e = [], d = 0; d < b.length; d++) e[d] = planetSaver(b[d]);
    return e
}

function planetArraySaver33(b) {
    for (var e = [], d = 0; d < b.length; d++) e[d] = planetSaver33(b[d]);
    return e
}

function planetArraySaver30(b) {
    for (var e = [], d = 0; d < b.length; d++) e[d] = planetSaver30(b[d]);
    return e
}

function Route(b, e) {
    this.id = 0;
    this.planet1 = planets[planetsName[b]].id;
    this.planet2 = planets[planetsName[e]].id;
    this.cx = function () {
        return planets[this.planet1].x - planets[this.planet2].x
    };
    this.cy = function () {
        return planets[this.planet1].y - planets[this.planet2].y
    };
    this.distance = function () {
        return Math.floor(Math.sqrt(Math.pow(this.cx(), 2) + Math.pow(this.cy(), 2)))
    };
    this.other = function (b) {
        var d = this.planet1;
        b == d && (d = this.planet2);
        return d
    };
    this.isPresent = function (b) {
        var d = !1;
        this.planet1 == b ? d = !0 : this.planet2 ==
            b && (d = !0);
        return d
    }
}

function PlanetInfo(b, e, d, h, g) {
    this.radius = b;
    this.temp = e;
    this.atmos = d;
    this.orbit = h;
    this.color = g
}

function Nebula(b, e) {
    this.name = b;
    this.icon = e;
    this.planets = [];
    this.av = !1;
    this.id = 0;
    this.searchPlanet = function (b) {
        for (var d = !1, e = 0; !d && e < this.planets.length;) this.planets[e] == b && (d = !0), e++;
        return d
    };
    this.pushPlanet = function (b) {
        this.searchPlanet(b) || (this.planets[this.planets.length] = b)
    };
    this.pushPlanet2 = function (b) {
        for (i = 0; i < b.length; i++) this.searchPlanet(b[i]) || (this.planets[this.planets.length] = b[i], planets[b[i]].map = this.id)
    }
}

function Research(b) {
    this.civis = null;
    this.id = b.id;
    this.tier = 0;
    this.req = b.req || {};
    this.questRequirement = b.questRequirement || {};
    this.name = b.name;
    this.descSave = b.desc;
    this.buildingBonus = b.bb || {};
    this.extraDescription = new Function(b.desc);
    this.description = function () {
        var b = "",
            d;
        for (d in this.buildingBonus) this.buildingBonus[d].showCondition || (this.buildingBonus[d].showCondition = function () {
            return !0
        });
        for (d in this.buildingBonus) {
            var h = this.buildingBonus[d];
            h.showCondition() && h.level - 1 <= this.level && game.buildings[buildingsName[h.id]].showRes() &&
                (b += "<span class='blue_text' style='font-size:100%;'>" + buildings[buildingsName[h.id]].displayName + "</span> - <span class='blue_text' style='font-size:100%;'>" + h.resource.capitalize() + "</span> production +" + h.value + "% <br>")
        }
        return b += this.extraDescription()
    };
    this.simplyAvailable = function () {
        var b = !0,
            d;
        for (d in this.req) game.researches[researchesName[d]].available() || (b = !1);
        return b
    };
    this.available = function () {
        var b = !0,
            d;
        for (d in this.req)
            if (!game.researches[researchesName[d]].available() || game.researches[researchesName[d]].level <
                this.req[d]) b = !1;
        return b
    };
    this.extraBonus = function () {};
    this.bonus = function () {
        for (var b in this.buildingBonus) {
            var d = this.buildingBonus[b];
            d.level <= this.level && (game.buildings[buildingsName[d.id]].resourcesProd[resourcesName[d.resource].id] *= 1 + d.value / 100)
        }
        this.extraBonus()
    };
    this.extraUnbonus = function () {};
    this.unbonus = function () {
        for (var b in this.buildingBonus) {
            var d = this.buildingBonus[b];
            d.level <= this.level && (game.buildings[buildingsName[d.id]].resourcesProd[resourcesName[d.resource].id] /= 1 + d.value /
                100)
        }
        this.extraUnbonus()
    };
    this.researchPoint = b.researchPoint;
    this.techPoint = b.techPoint || 10;
    this.mult = b.mult || 2.2;
    this.multBonus = b.multBonus || 1.2;
    this.cost = function () {
        return this.researchPoint * Math.pow(this.mult, this.level - this.bonusLevel)
    };
    this.costBonus = function () {
        return this.techPoint * Math.pow(this.multBonus, this.bonusLevel)
    };
    this.totalCost = function () {
        for (var b = 0, d = 0; d < this.level - this.bonusLevel; d++) b += this.researchPoint * Math.pow(this.mult, d);
        return b
    };
    this.totalBonusCost = function () {
        for (var b =
                0, d = 0; d < this.bonusLevel; d++) b += this.techPoint * Math.pow(this.multBonus, d);
        return b
    };
    this.icon = b.icon || "void.png";
    this.bonusLevel = this.level = 0;
    this.max = b.max || 1E4;
    this.enabled = !1;
    this.value = function () {
        return 100 / this.cost() + 1 / (this.level + 30)
    };
    this.enable = function () {
        game.researchPoint >= this.cost() && (this.enabled = !0, game.researchPoint -= this.cost(), this.level++, this.bonus())
    };
    this.enableBonus = function () {
        game.techPoints >= this.costBonus() && (this.enabled = !0, game.techPoints -= this.costBonus(), this.level++,
            this.bonusLevel++, this.bonus())
    };
    this.buy = function () {
        null != this.civis && civis[this.civis].researchPoint >= this.cost() && (this.enabled = !0, civis[this.civis].researchPoint -= this.cost(), this.level++, this.bonus())
    };
    this.requirement = function () {
        return !1
    }
}

function researchLoader(b, e) {
    for (var d = e.l || e.level || 0, h = e.b || e.bonus || 0, g = 0; g < Math.min(d + h, 1E3); g++) b.level++, b.bonus();
    b.bonusLevel = h
}

function Book(b) {
    this.title = b.title;
    this.pages = b.pages;
    this.pageNum = this.pages.lenth;
    this.requirement = b.req
}
var quests = [];
questNames = [];

function Quest(b) {
    this.id = b.id;
    this.name = b.name;
    this.type = b.type;
    this.civis = b.civis || 0;
    this.provider = b.provider || 0;
    this.description = b.description || "";
    this.objective = b.objective || "";
    this.bonusDescription = b.bonusDescription || !1;
    this.questRequired = {};
    this.resources = b.resources || {};
    this.planet = b.planet || null;
    if (b.questRequired)
        for (var e = 0; e < b.questRequired.length; e++) this.questRequired[b.questRequired[e]] = !0;
    if (null != this.planet) {
        e = "<span class='white_text'>Bring </span>";
        var d = 0,
            h;
        for (h in this.resources) e += "<span class='blue_text'>" +
            beauty(this.resources[h]) + " " + h.capitalize() + "</span>", d++;
        e += "<span class='white_text'> in orbit to </span><span class='blue_text'>" + planets[this.planet].name + "</span>";
        0 < d && (this.objective += e)
    }
    this.repReward = b.repReward || 0;
    this.repNeeded = b.repNeeded || 0;
    this.bonusReward = b.bonusReward || function () {};
    this.isRepeatable = b.isRepeatable || !1;
    this.civisSupported = b.civisSupported || [];
    this.notified = this.accepted = this.done = !1;
    this.bonusRequirement = b.bonusRequirement || function () {
        return !0
    };
    this.available = function () {
        var b = !0,
            d;
        for (d in this.questRequired) quests[questNames[d]].done || (b = !1);
        return this.civisSupported.has(game.id) && game.reputation[this.provider] >= this.repNeeded && b && this.bonusRequirement()
    };
    this.first = b.first;
    this.choices = b.choices;
    this.reward = function () {
        this.checkCompletion() && (this.scaleResources(), game.reputation[this.provider] += this.repReward, civis[this.provider].reputation[game.id] += this.repReward, this.bonusReward(), this.done = !0)
    };
    this.checkResources = function () {
        if (null == this.planet) return !0;
        var b =
            0,
            d;
        for (d in this.resources) b++;
        if (0 == b) return !0;
        for (var e in planets[this.planet].fleets)
            if (b = planets[this.planet].fleets[e], b.civis == game.id) {
                var h = !0;
                for (d in this.resources) b.storage[resourcesName[d].id] < this.resources[d] && (h = !1);
                if (h) return !0
            }
        return !1
    };
    this.scaleResources = function () {
        if (null == this.planet) return !0;
        var b = 0,
            d;
        for (d in this.resources) b++;
        if (0 == b) return !0;
        b = null;
        for (var e in planets[this.planet].fleets) {
            var h = planets[this.planet].fleets[e];
            if (h.civis == game.id) {
                var x = !0;
                for (d in this.resources) h.storage[resourcesName[d].id] <
                    this.resources[d] && (x = !1);
                x && (b = h)
            }
        }
        for (d in this.resources) b.storage[resourcesName[d].id] >= this.resources[d] && (b.storage[resourcesName[d].id] -= this.resources[d])
    };
    this.check = b.check || function () {
        return !0
    };
    this.checkCompletion = function () {
        return !this.done && this.check() && this.checkResources() && this.available() ? !0 : !1
    }
}

function questChecker() {
    for (var b = 0; b < quests.length; b++) 0 < civis[quests[b].provider].planets.length && !quests[b].notified && quests[b].checkCompletion() && quests[b].available() && (quests[b].notified = !0, (new exportPopup(300, 0, "<span class='green_text'>You can now claim the reward of</span><br><span class='blue_text'>" + quests[b].name + "</span>", "info")).drawToast())
}

function QuestLine(b) {
    this.id = b.id;
    this.name = b.name;
    this.civis = b.civis;
    this.currentQuest = b.startingQuest
}

function Tutorial(b) {
    this.id = b.id;
    this.done = !1;
    this.description = b.description;
    this.check = b.check || function () {};
    this.actionInternal = b.action || function () {};
    this.extraAction = b.extraAction || function () {};
    this.action = function () {
        tutorials[getAvailableTutorial()].actionInternal();
        tutorials[getAvailableTutorial()].done = !0;
        tutorials[getAvailableTutorial()].drop()
    };
    this.listener = b.listener || function () {
        return !0
    };
    this.drop = b.drop || function () {}
}
var tutorials = [],
    baseCheckTut = function () {
        return !0
    };
tutorials.push(new Tutorial({
    id: "tut0",
    description: "<br>Welcome Commander!<br>You finally woke up after a long cryosleep",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetInterface(planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut1",
    description: "<br>232 years have passed since you boarded the Vitha, but finally you reached your new home Promision!",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetInterface(planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut2",
    description: "<br>Let's do a little briefing.<br>In this interface you can see basic infos about your planet.",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetInterface(planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut3",
    description: "<br>On the left you can see a list of resources that can be <span class='white_text' style='font-size:100%'>extracted</span> on this planet, like <span class='white_text' style='font-size:100%'>Iron</span>",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetInterface(planets[0]);
        $("#planet_info").css("z-index", 1E3)
    },
    drop: function () {
        $("#planet_info").css("z-index", 0)
    }
}));
tutorials.push(new Tutorial({
    id: "tut4",
    description: "To open this tutorial again, click on the <img src='ui/t.png' style='height:26px;width:26px;position:relative;top:6px' /> icon in the bottom-right corner of the screen",
    check: baseCheckTut
}));
tutorials.push(new Tutorial({
    id: "tut4",
    description: "Let's extract " + uiScheduler.getSpan({
        color: "white",
        content: "Iron"
    }) + "! Click on the <img src='ui/extraction.png' style='height:26px;width:26px;position:relative;top:6px' /> icon in the bottom menu to access the " + uiScheduler.getSpan({
        color: "white",
        content: "Extraction Tab"
    }),
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetInterface(planets[0]);
        $("#planet_info").css("z-index", 0);
        $("#b_extraction_icon").css("z-index", 0)
    },
    drop: function () {
        $("#planet_info").css("z-index",
            0)
    }
}));
tutorials.push(new Tutorial({
    id: "tut6",
    description: "<br>In this interface, you can construct buildings to extract resources. By clicking on the desired building, you can see more details about it",
    check: function () {
        return "planetBuildingInterface_mining" == currentInterface && currentPlanet == planets[0]
    },
    extraAction: function () {
        exportPlanetBuildingInterface("mining", planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut7",
    description: "<br>On the left you can see how many resources are being produced every second.",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("mining", planets[0]);
        $("#planet_mini").css("z-index", 1E3)
    },
    drop: function () {
        $("#planet_info").css("z-index", 0);
        $("#planet_mini").css("z-index", 0)
    }
}));
tutorials.push(new Tutorial({
    id: "tut8",
    description: "Now click on the <img src='ui/add2.png' style='height:26px;width:26px;position:relative;top:6px' /> icon below the " + uiScheduler.getSpan({
        color: "white",
        content: "Mining Plant"
    }) + " to build 1 more",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("mining", planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut8",
    description: "<br>Perfect! You can now see on the right how iron production has doubled!",
    check: function () {
        return 1 < planets[0].structure[buildingsName.mine].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("mining", planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut9",
    description: "<br>Keep building Mining Plants, until you reach 10 of them. Should only take few seconds!",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("mining", planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut10",
    description: "<br>Perfect! But Iron is not the only resource you will need. Let's build 1 " + uiScheduler.getSpan({
        color: "white",
        content: "Methane Extractor"
    }) + " (right below the " + uiScheduler.getSpan({
        color: "white",
        content: "Mining Plant"
    }) + ") to extract " + uiScheduler.getSpan({
        color: "white",
        content: "Methane"
    }) + "!",
    check: function () {
        return 10 <= planets[0].structure[buildingsName.mine].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("mining", planets[0])
    }
}));
tutorials.push(new Tutorial({
    id: "tut11",
    description: "Great! But Methane alone is not that useful, we need " + uiScheduler.getSpan({
        color: "white",
        content: "Fuel"
    }) + ". Click on the <img src='ui/production.png' style='height:26px;width:26px;position:relative;top:3px' /> icon in the bottom menu to access the " + uiScheduler.getSpan({
        color: "white",
        content: "Production Tab"
    }) + ".",
    check: function () {
        return 0 < planets[0].structure[buildingsName.methaneext].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("mining",
            planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>In this interface you can construct buildings that transform raw resources, like iron and methane, into more useful and advanced resources.",
    check: function () {
        return "planetBuildingInterface_prod" == currentInterface && currentPlanet == planets[0]
    },
    extraAction: function () {
        exportPlanetBuildingInterface("prod", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Let's construct a " + uiScheduler.getSpan({
        color: "white",
        content: "Methane Processer"
    }) + " to convert methane into fuel. By clicking on it, you can see that it consumes 2 methane every second to produce fuel.",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("prod", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Well done! But wait, now your production of methane is negative, because the processer needs 2 methane every second! Build another " + uiScheduler.getSpan({
        color: "white",
        content: "Methane Extractor"
    }),
    check: function () {
        return 0 < planets[0].structure[buildingsName.converter].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("prod", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>That's good! You can now produce fuel without running out of methane. You will need fuel to power " + uiScheduler.getSpan({
        color: "white",
        content: "Foundries"
    }) + " that in turn produce " + uiScheduler.getSpan({
        color: "white",
        content: "Steel"
    }),
    check: function () {
        return 1 < planets[0].structure[buildingsName.methaneext].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("prod", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Every " + uiScheduler.getSpan({
        color: "white",
        content: "Foundry"
    }) + " needs 2 " + uiScheduler.getSpan({
        color: "white",
        content: "Fuel"
    }) + " but you only produce 1 per second. Build an additional " + uiScheduler.getSpan({
        color: "white",
        content: "Methane Processer"
    }) + " and enough " + uiScheduler.getSpan({
        color: "white",
        content: "Methane Extractors"
    }) + " to balance methane production",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("prod", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>" + uiScheduler.getSpan({
        color: "white",
        content: "Foundries"
    }) + " will also consume " + uiScheduler.getSpan({
        color: "white",
        content: "Graphite and Iron"
    }) + ". Build a " + uiScheduler.getSpan({
        color: "white",
        content: "Graphite Extractor"
    }) + " and then a " + uiScheduler.getSpan({
        color: "white",
        content: "Foundry"
    }),
    check: function () {
        return 1 < planets[0].structure[buildingsName.converter].number && 4 <= planets[0].structure[buildingsName.methaneext].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("mining",
            planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>" + uiScheduler.getSpan({
        color: "white",
        content: "Steel"
    }) + " will be a very important resource for construction. Build more " + uiScheduler.getSpan({
        color: "white",
        content: "Foundries, Methane Extractor/Processer and Mining Plants"
    }) + " until you produce 50 iron per second and 4 steel per second",
    check: function () {
        return 0 < planets[0].structure[buildingsName.graphext].number && 0 < planets[0].structure[buildingsName.foundry].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("prod", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "You now have a nice basic setup, build a " + uiScheduler.getSpan({
        color: "white",
        content: "Small Generator"
    }) + " in order to produce " + uiScheduler.getSpan({
        color: "white",
        content: "Energy"
    }) + ".<br>You can find it by clicking on the <img src='ui/energy.png' style='height:26px;width:26px;position:relative;top:3px' /> icon.",
    check: function () {
        return 50 <= planets[0].globalProd[resourcesName.iron.id] / idleBon && 4 <= planets[0].globalProd[resourcesName.steel.id] / idleBon
    },
    extraAction: function () {
        exportPlanetBuildingInterface("prod",
            planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "Oh no! The generator is now consuming 3 fuel per second! It may a be a good idea to temporarily turn off Foundries. Click on <img src='ui/act.png' style='height:24px;width:24px;position:relative;top:3px' /> the icon next to the Foundry",
    check: function () {
        return 0 < planets[0].structure[buildingsName.generator].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("energy", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Great, now the foundries are inactive and thus there will be enough fuel to power the generator. The energy consumption and production can be seen on the left info panel.",
    check: function () {
        return !planets[0].structure[buildingsName.foundry].active
    },
    extraAction: function () {
        exportPlanetBuildingInterface("energy", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>You can construct buildings even if you don't have energy for them, but they will work with lowered efficiency.",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("energy", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "There is now enough energy to power a " + uiScheduler.getSpan({
        color: "white",
        content: "Laboratory"
    }) + " so let's build one. Click on the <img src='ui/dna.png' style='height:26px;width:26px;position:relative;top:3px' /> icon to access the " + uiScheduler.getSpan({
        color: "white",
        content: "Research Tab"
    }),
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("energy", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "If you have not enough steel to build a laboratory, you can reactivate foundries by clicking on the <img src='ui/shut.png' style='height:24px;width:24px;position:relative;top:3px' /> icon",
    check: baseCheckTut,
    extraAction: function () {
        exportPlanetBuildingInterface("energy", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "Excellent! You now produce research points, also known as RP. You can see researches clicking on the <img src='ui/research.png' style='height:26px;width:26px;position:relative;top:3px' /> icon in the top menu.",
    check: function () {
        return 0 < planets[0].structure[buildingsName.lab].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("research", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Here you can see the technology tree. Let's start with " + uiScheduler.getSpan({
        color: "white",
        content: "Geology"
    }) + " which will boost iron extraction. When you have enough RP, buy it.",
    check: function () {
        return "researchInterface" == currentInterface || "techInterface" == currentInterface
    },
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Perfect! You have also unlocked a new research: " + uiScheduler.getSpan({
        color: "white",
        content: "Material Science"
    }) + ". It will boost several construction resources so it will be very useful.",
    check: function () {
        return 1 <= game.researches[researchesName.mineralogy].level
    },
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "<br>" + uiScheduler.getSpan({
        color: "white",
        content: "Geology 3"
    }) + " will unlock new buildings to extract " + uiScheduler.getSpan({
        color: "white",
        content: "Titanium"
    }) + "<br>So let's buy Geology 3 and Material Science 1.",
    check: baseCheckTut,
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Perfect! But things will get harder from now on. Researches will increase their cost quite rapidly, so you will need to boost RP production! And RP prodution will need other resources, and so on",
    check: function () {
        return 3 <= game.researches[researchesName.mineralogy].level && 1 <= game.researches[researchesName.material].level
    },
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "<br>You can continue on your own for now. You should boost your productions until you can research " + uiScheduler.getSpan({
        color: "white",
        content: "Interstellar Travel"
    }),
    check: baseCheckTut,
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "<br>" + uiScheduler.getSpan({
        color: "white",
        content: "Interstellar Travel"
    }) + " will let you explore the universe that surrounds us! You can build spaceships in the " + uiScheduler.getSpan({
        color: "white",
        content: "Shipyard"
    }) + " and use them to colonize new planets!",
    check: function () {
        return 1 <= game.researches[researchesName.astronomy].level
    },
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "Now click on the <img src='ui/loading.png' style='height:26px;width:26px;position:relative;top:3px' /> icon to access the " + uiScheduler.getSpan({
        color: "white",
        content: "Other Buildings Tab"
    }) + " and build a Shipyard",
    check: baseCheckTut,
    extraAction: function () {
        exportTechInterface()
    }
}));
tutorials.push(new Tutorial({
    description: "Now go to the " + uiScheduler.getSpan({
        color: "white",
        content: "Shipyard Interface"
    }) + " by clicking on the <img src='ui/ship.png' style='height:26px;width:26px;position:relative;top:8px' /> icon in the bottom menu",
    check: function () {
        return 0 < planets[0].structure[buildingsName.shipyard].number
    },
    extraAction: function () {
        exportPlanetBuildingInterface("other", planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>In this interface you can buy Spaceships!. Building more shipyards will unlock new and more powerful spaceships.",
    check: function () {
        return "shipyardInterface" == currentInterface
    },
    extraAction: function () {
        exportShipyardInterface(planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "When you have enough resources, build a " + uiScheduler.getSpan({
        color: "white",
        content: "Vitha Colonial Ship"
    }) + ", then click on the <img src='ui/military.png' style='height:26px;width:26px;position:relative;top:8px' /> icon in the top menu. ",
    check: baseCheckTut,
    extraAction: function () {
        exportShipyardInterface(planets[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>In this interface you will see the list of every fleet in your empire. If you have built a Vitha, then you will find it here under the name of Colonial Fleet.",
    check: function () {
        return "shipInterface" == currentInterface
    },
    extraAction: function () {
        exportShipInterface({
            t: "cargo",
            p: 0
        })
    }
}));
tutorials.push(new Tutorial({
    description: "You will always need a colonial ship when colonizing new planets. So let's colonize! Click on the <img src='ui/move.png' style='height:28px;width:28px;position:relative;top:8px' /> icon under the colonial fleet to move it.",
    check: baseCheckTut,
    extraAction: function () {
        exportShipInterface({
            t: "cargo",
            p: 0
        })
    }
}));
tutorials.push(new Tutorial({
    description: "<br>Click on the white planet named " + uiScheduler.getSpan({
        color: "white",
        content: "Vasilis"
    }) + " to move the fleet.",
    check: function () {
        return "mapInterface" == currentInterface
    },
    extraAction: function () {
        "mapInterface" != currentInterface && exportMapInterface(nebulas[0])
    }
}));
tutorials.push(new Tutorial({
    description: "<br>It will take some minutes to reach the planet, once it does, you will find the fleet again in the fleet interface.",
    check: baseCheckTut,
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>Once there, there will be the caption '" + uiScheduler.getSpan({
        color: "white",
        content: "Orbiting Vasilis"
    }) + "' next to the colonial fleet name. Then click on the fleet, and scroll the right planet until you find the button " + uiScheduler.getSpan({
        color: "white",
        content: "Colonize Vasilis"
    }) + ". Click it and you will have a new planet!",
    check: baseCheckTut,
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>Great, you colonized Vasilis! Like on Promision, here you can set up production chains. But wait! Vasilis does not have graphite!",
    check: function () {
        return game.searchPlanet(1)
    },
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>When you are done setting things up, you should import Graphite from Promision. How? Make a cargo fleet in Promision, click on the <img src='ui/automove.png' style='height:28px;width:28px;position:relative;top:8px' /> icon and then select Vasilis.",
    check: baseCheckTut,
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>Here you go! In this interface you are creating an automatic transport route. For example, it may go from Promision to Vasilis and back transporting graphite to vasilis and steel back to Promision!",
    check: function () {
        return "setAutoRouteInterface" == currentInterface
    },
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>Now, under the column relative to Promision, find the entry relative to Graphite. In the first textbox you can specify a per second amount, while in the second textbox you can specify an absolute amount.",
    check: baseCheckTut,
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>Here is an example:<br><img src='ui/autotuto.png' style='width:350px;position:relative;top:8px' />",
    check: baseCheckTut,
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>Great, your auto-route will go back and forth delivering useful goods! ",
    check: function () {
        return "travelingShipInterface" == currentInterface && "auto" == currentCriteriaAuto
    },
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    description: "<br>If you need to modify the transported resources, you can click on the auto-route and you will see the option " + uiScheduler.getSpan({
        color: "white",
        content: "Edit automatic route"
    }) + " on the right menu (you may need to scroll)",
    check: baseCheckTut,
    extraAction: function () {}
}));
tutorials.push(new Tutorial({
    id: "tutlast",
    description: "If you see this, there is clearly a problem...",
    check: function () {
        return !1
    }
}));
for (var tutorialsNames = [], q = 0; q < tutorials.length; q++) tutorials[q].id = "tut" + q, tutorialsNames[tutorials[q].id] = q;
tutorials[tutorials.length - 1].id = "tutlast";

function getAvailableTutorial() {
    for (var b = 0; b < tutorials.length; b++)
        if (!tutorials[b].done) return b;
    return tutorials.length
}

function tutorialChecker(b) {
    var e = tutorials[getAvailableTutorial()];
    !e || currentPopup && "tutorial" == currentPopup.type && !b || !e.check() || gameSettings.hideTutorial || ((new exportPopup(360, 96, "<span class='blue_text text_shadow'>" + e.description + "</span>", "tutorial", e.action)).draw(), e.extraAction())
}
var minimumBonusTime = 60;

function showPopupIdleBonus(b) {
    game.idleTime < minimumBonusTime && (game.idleTime = 60);
    var e = Math.floor(game.idleTime % 60),
        d = Math.floor(game.idleTime / 60) % 60,
        h = Math.floor(game.idleTime / 3600) % 24;
    1 <= h && parseInt(h);
    (1 <= d || 1 <= h) && parseInt(d);
    parseInt(e);
    b || (b = "");
    (1 <= e || 1 <= d || 1 <= h) && (new exportPopup(210, 96, "<br><span class='blue_text text_shadow'>Idle bonus for 60 seconds<br><br></span><span class='green_text text_shadow'>Production x" + Math.floor(100 * idleBon) / 100 + "</span>" + b, "Ok")).draw()
}

function setIdleBonus() {
    var b = (new Date).getTime() - game.lastSaved;
    0 > b && (b = 0);
    b = 1 + b / 1E3 / 60;
    1E3 < b && (b = 1E3);
    idleBon = b;
    idleTimeout = setTimeout(function () {
        idleBon = 1;
        (new exportPopup(210, 0, "<span class='blue_text text_shadow'>Idle Bonus ended!</span>", "info")).drawToast()
    }, 6E4);
    showPopupIdleBonus()
}

function Corporation(b, e, d) {
    this.name = b;
    this.currentQuest = null;
    this.questList = [];
    this.rep = 0;
    this.av = !1;
    this.pow = e;
    this.msg = d || "";
    this.subMsg = function () {
        return "<span class='white_text'>You need at least </span><span class='blue_text'>" + beauty(this.pow) + "</span><span class='white_text'> power to join </span><span class='blue_text'>" + this.name + "</span>"
    }
}

function Entry(b, e) {
    this.quest = b;
    this.next = e
}

function QuestScheduler() {
    this.head = null;
    this.add = function (b) {
        this.head = new Entry(b, this.head)
    };
    this.pop = function () {
        if (null === this.head) return null;
        var b = this.head.quest;
        this.head = this.next;
        return b
    }
}

function ShipPart(b) {
    this.name = b.name || "Component";
    this.power = b.power || 0;
    this.hp = b.hp || 0;
    this.speed = b.speed || 0;
    this.armor = b.armor || 0;
    this.piercing = b.piercing || 0;
    this.storage = b.storage || 0;
    this.weight = b.weight || 0;
    this.shield = b.shield || 0;
    this.size = b.size || 1;
    this.type = b.type || "Component";
    this.subType = b.subType || "Component";
    this.cost = Array(resNum);
    for (var e = 0; e < resNum; e++) this.cost[e] = 0;
    for (e in b.cost) this.cost[resourcesName[e].id] = b.cost[e] || 0
}

function Hull(b) {
    this.name = b.name;
    this.size = b.size || 0;
    this.type = b.type || "Spaceship";
    this.power = b.power || 0;
    this.speed = b.speed || 0;
    this.hp = b.hp || 0;
    this.armor = b.armor || 0;
    this.piercing = b.piercing || 0;
    this.weight = b.weight || 2;
    this.shield = b.shield || 0;
    this.storage = b.storage || 0
}

function Blueprint(b) {
    this.name = b.name;
    this.hull = b.hull;
    this.parts = b.parts || {};
    this.toShip = function () {
        var b = new Ship;
        b.power = this.hull.power;
        b.speed = this.hull.speed;
        b.hp = this.hull.hp;
        b.armor = this.hull.armor;
        b.piercing = this.hull.piercing;
        b.weight = this.hull.weight;
        b.shield = this.hull.shield;
        b.storage = this.hull.storage;
        b.type = this.hull.type;
        for (var d in this.parts) {
            var h = shipParts[d],
                g = this.parts[d];
            b.power = h.power * g;
            b.speed = h.speed * g;
            b.hp = h.hp * g;
            b.armor = h.armor * g;
            b.piercing = h.piercing * g;
            b.weight = h.weight *
                g;
            b.shield = h.shield * g;
            b.storage = h.storage * g
        }
    };
    this.cost = function () {}
}
var hulls = [],
    hll = new Hull({
        name: "25 meters Hull",
        type: "Fighter",
        size: 3
    });
hulls.push(hll);
hll = new Hull({
    name: "80 meters Hull",
    type: "Frigate",
    size: 8
});
hulls.push(hll);
hll = new Hull({
    name: "150 meters Hull",
    type: "Destroyer",
    size: 21
});
hulls.push(hll);
hll = new Hull({
    name: "80 meters Ultra-light Hull",
    type: "Incursor",
    size: 3
});
hulls.push(hll);
hll = new Hull({
    name: "200 meters Heavy Hull",
    type: "Shield ship",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "350 meters Hull",
    type: "Battlecruiser",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "500 meters Hull",
    type: "Battleship",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "1200 meters Hull",
    type: "Admiral",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "3500 meters Imperial Hull",
    type: "Imperial Ship",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "11000 meters Hull",
    type: "Capital Ship",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "Heavy Technetium Hull",
    type: "Assault Ship",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "Ultra Light Nanotubes Hull",
    type: "Servant Ship",
    size: 50
});
hulls.push(hll);
hll = new Hull({
    name: "Osmium Hull",
    type: "Servant Ship",
    size: 50
});
hulls.push(hll);
var shipParts = [],
    spp = new ShipPart({
        name: "Low Energy Laser",
        type: "weapon",
        subType: "Light Emitting Weapon",
        power: 8,
        weight: 10,
        cost: {
            steel: 3E4,
            titanium: 2E3,
            "full battery": 2
        }
    });
shipParts.push(spp);
spp = new ShipPart({
    name: "High Energy Laser",
    type: "weapon",
    subType: "Light Emitting Weapon",
    size: 4,
    power: 75,
    weight: 10,
    cost: {
        steel: 3E4,
        titanium: 2E3,
        "full battery": 5
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Resonant Light Emitter",
    type: "weapon",
    subType: "Light Emitting Weapon",
    size: 4,
    power: 75,
    weight: 10,
    cost: {
        steel: 3E4,
        titanium: 2E3,
        "full battery": 5
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Double Wave Light Emitter",
    type: "weapon",
    subType: "Light Emitting Weapon",
    size: 4,
    power: 75,
    weight: 10,
    cost: {
        steel: 3E4,
        titanium: 2E3,
        "full battery": 5
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Halean Light Burster",
    type: "weapon",
    subType: "Light Emitting Weapon",
    size: 4,
    power: 75,
    weight: 10,
    cost: {
        steel: 3E4,
        titanium: 2E3,
        "full battery": 5
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Osmium Blade",
    type: "weapon",
    subType: "Contact Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Karan Cutter",
    type: "weapon",
    subType: "Contact Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Hull Driller",
    type: "weapon",
    subType: "Contact Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "100m Mass Accelerator",
    type: "weapon",
    subType: "Ballistic Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "300m Mass Accelerator",
    type: "weapon",
    subType: "Ballistic Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "800m Mass Accelerator",
    type: "weapon",
    subType: "Ballistic Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "2000m Mass Accelerator",
    type: "weapon",
    subType: "Ballistic Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "7000m Mass Accelerator",
    type: "weapon",
    subType: "Ballistic Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Fusion Powered Cannon",
    type: "weapon",
    subType: "Energy Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Antimatter Repulsor",
    type: "weapon",
    subType: "Energy Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Oil Burner Radiator",
    type: "weapon",
    subType: "Energy Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Fission Radiator",
    type: "weapon",
    subType: "Energy Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Biochemical Radiator",
    type: "weapon",
    subType: "Energy Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Sulfur Burner Radiator",
    type: "weapon",
    subType: "Energy Weapon",
    size: 2,
    power: 75,
    weight: 10,
    cost: {
        osmium: 100
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Titanium Armor",
    type: "protection",
    subType: "Armor",
    armor: 350,
    hp: 55,
    speed: -.5,
    weight: 40,
    cost: {
        steel: 3E4,
        titanium: 2E3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Nanotubes Armor",
    type: "protection",
    subType: "Armor",
    armor: 350,
    hp: 55,
    speed: -.5,
    weight: 40,
    cost: {
        steel: 3E4,
        titanium: 2E3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Technetium Armor",
    type: "protection",
    subType: "Armor",
    armor: 350,
    hp: 55,
    speed: -.5,
    weight: 40,
    cost: {
        steel: 3E4,
        titanium: 2E3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Titanium Armor",
    type: "protection",
    subType: "Armor",
    armor: 350,
    hp: 55,
    speed: -.5,
    weight: 40,
    cost: {
        steel: 3E4,
        titanium: 2E3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Osmium Armor",
    type: "protection",
    subType: "Armor",
    armor: 350,
    hp: 55,
    speed: -.5,
    weight: 40,
    cost: {
        steel: 3E4,
        titanium: 2E3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Solar Powered Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Methane Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Uranium Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Hydrogen Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Electric Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Biowaste Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Sulfur Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Fuel Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);
spp = new ShipPart({
    name: "Antimatter Engine",
    type: "engine",
    subType: "Engine",
    size: 2,
    speed: 2.8,
    weight: 20,
    cost: {
        steel: 9E4,
        titanium: 1E3,
        "full battery": 3
    }
});
shipParts.push(spp);

function Ship(b) {
    this.icon = b.icon || null;
    this.id = b.id || 0;
    this.req = b.req || 1E3;
    this.resReq = b.resReq || 0;
    this.name = b.name;
    this.type = b.type;
    this.valueMult = 1 - b.novalue || 1;
    this.power = b.power || 0;
    this.piercing = b.piercing || 0;
    this.armor = b.armor || 1;
    this.shield = b.shield || 0;
    this.speed = b.speed || .1;
    this.travelSpeed = b.travelSpeed || this.speed;
    this.maxStorage = b.storage || 0;
    this.hp = b.hp || 0;
    this.special = b.special || !1;
    this.weapon = b.weapon || "ballistic";
    this.cost = Array(resNum);
    for (var e = 0; e < resNum; e++) this.cost[e] = 0;
    var d =
        b.cost || [];
    for (e = 0; e < resNum; e++) this.cost[e] = d[resources[e].name] || 0;
    this.population = d.population || 0;
    this.fuel = b.fuel || null;
    this.weight = b.weight || 1;
    this.combatWeight = b.combatWeight || this.weight;
    this.show = function () {
        var b = !0,
            d;
        for (d in this.resReq) this.resReq[d] > game.researches[researchesName[d]].level && (b = !1);
        return b
    };
    this.armorReduction = function (b) {
        return 1 - 1 / (1 + Math.log(1 + this.armor * (1 + b / (2 * mi)) / 1E4) / Math.log(2))
    }
}

function Rank(b, e, d) {
    this.name = b;
    this.color = e;
    this.requirement = d
}

function Achievement(b, e, d) {
    this.name = b;
    this.requirement = e;
    this.desc = function () {
        return ""
    };
    this.av = !1
}

function civisLoader(b, e, d) {
    b.money = e.money || 0;
    b.researchPoint = e.researchPoint;
    b.days = e.days;
    b.lastSaved = e.lastSaved;
    b.timeTravelNum = e.timeTravelNum || 0;
    b.idleTime = e.idleTime || 0;
    b.chosenGovern = e.chosenGovern || "none";
    b.techPoints = e.techPoints ? e.techPoints / bi : e.techPoints2 || 0;
    b.maps = e.maps || {
        0: 1
    };
    if (e.reput)
        for (d = 0; d < e.reput.length; d++) $.isNumeric(e.reput[d]) && b.setReputation(d, e.reput[d]);
    b.planets = [];
    b.planetsTransport = [];
    for (d = 0; d < e.planets.length; d++) b.pushPlanet(e.planets[d]);
    if (e.researches)
        for (d =
            0; d < e.researches.length; d++) e.researches[d] && researchLoader(b.researches[d], e.researches[d])
}

function civisSaver(b) {
    var e = {};
    e.id = b.id;
    e.name = b.name;
    e.money = b.money || 0;
    e.researchPoint = b.researchPoint;
    e.techPoints2 = b.techPoints;
    e.days = b.days;
    e.lastSaved = (new Date).getTime();
    e.timeTravelNum = b.timeTravelNum;
    e.maps = b.maps;
    e.govern = b.govern;
    e.idleTime = b.idleTime || 0;
    e.reput = [];
    for (var d = 0; d < b.reputation.length; d++) e.reput[d] = b.reputation[d];
    e.planets = [];
    for (d = 0; d < b.planets.length; d++) e.planets[d] = b.planets[d];
    if (0 == b.id)
        for (e.researches = [], d = 0; d < b.researches.length; d++) e.researches[d] = {
            l: b.researches[d].level -
                b.researches[d].bonusLevel,
            b: b.researches[d].bonusLevel
        };
    e.fleets = b.fleets;
    return e
}

function civisArraySaver(b) {
    for (var e = [], d = 0; d < b.length; d++) e[d] = civisSaver(b[d]);
    return e
}

function Market() {
    this.stock = Array(resNum);
    this.maxStock = Array(resNum);
    for (var b = 0; b < resNum; b++) this.stock[b] = 0, this.maxStock[b] = mi * mi / resourcesPrices[b];
    this.esportTime = 50;
    this.fees = .03;
    this.esport = function (b) {
        if (0 >= this.esportTime) {
            for (b = 0; b < civis.length; b++)
                for (var d = 0; d < resNum; d++) {
                    this.stock[d] += 100 * civis[b].marketExport(d) - 100 * civis[b].marketImport(d);
                    if (game.searchPlanet(planetsName.virgo)) {
                        var e = 100 * (civis[b].marketExport(d) * this.sellPrice(d) + civis[b].marketImport(d) * this.buyPrice(d, game)) *
                            this.fees;
                        isNaN(e) || (game.money += e)
                    }
                    0 > this.stock[d] && (this.stock[d] = 0)
                }
            this.esportTime = (40 * Math.random() + 80) / idleBon
        } else this.esportTime -= b;
        isNaN(game.money) && (game.money = 0)
    };
    this.load = function (b) {
        for (var d = 0; d < resNum; d++) this.stock[d] = b[d]
    };
    this.toobj = function () {
        for (var b = {}, d = 0; d < resNum; d++) b[d] = this.stock[d];
        return b
    };
    this.sellPrice = function (b, d) {
        return resourcesPrices[b]
    };
    this.buyPrice = function (b, d) {
        return this.sellPrice(b, d) * this.buyTaxes(d)
    };
    this.buyTaxes = function (b) {
        for (var d = 0, e = 0; e < b.planets.length; e++) d +=
            planets[b.planets[e]].structure[buildingsName.tradehub].number;
        return 1 + .5 * Math.exp(-.01 * d)
    };
    this.sell = function (b) {
        for (var d = 0; d < resNum; d++) {
            var e = Math.max(0, Math.min(b.storage[d], this.maxStock[d] - this.stock[d]));
            this.stock[d] += e;
            civis[b.civis].money += this.sellPrice(d, civis[b.civis]) * e;
            b.storage[d] -= e
        }
    };
    this.buy = function () {}
}

function Government(b) {
    this.name = b.name;
    this.bonus = b.bonus;
    this.unbonus = b.unbonus;
    this.malus = b.malus;
    this.description = b.description
}

function Game(b, e, d, h, g, l, m) {
    this.version = GAME_VERSION;
    this.id = this.techPoints = this.timeTravelNum = 0;
    this.icon = "void.png";
    this.capital = 0;
    this.strategy = null;
    this.biomass = g;
    this.maps = {
        0: 1
    };
    this.govern = "none";
    this.showInTournament = !0;
    this.idleTime = 0;
    this.mapsLength = function () {
        var b = 0,
            d;
        for (d in this.maps) b++;
        return b
    };
    this.contacted = function () {
        return game.researches[3].level >= this.hops
    };
    this.repName = function (b) {
        return this.reputation[b] <= repLevel.hostile.max ? "hostile" : this.reputation[b] >= repLevel.neutral.min &&
            this.reputation[b] <= repLevel.neutral.max ? "neutral" : this.reputation[b] >= repLevel.friendly.min && this.reputation[b] <= repLevel.friendly.max ? "friendly" : this.reputation[b] >= repLevel.allied.min ? "allied" : "N/A"
    };
    this.days = this.researchPoint = this.money = 0;
    this.shortName = this.name = b;
    this.playerName = d;
    this.playerRace = e;
    this.description = h;
    this.playerRank = new Rank("Exiled", "#999", function () {
        return !0
    });
    this.timeDust = 0;
    this.planets = [];
    this.planetsTransport = [];
    this.lastSaved = (new Date).getTime();
    this.buildings = [];
    this.researches = [];
    this.ships = [];
    this.reputation = [];
    this.repLevel = null;
    this.completedQuest = {};
    this.acceptedQuest = {};
    this.lastRes = this.lastProd = 0;
    this.lastCheck = (new Date).getTime();
    this.lastTime = (new Date).getTime();
    this.map = this.researchPointProd = 0;
    this.esportage = Array(resNum);
    for (b = 0; b < resNum; b++) this.esportage[b] = {
        amount: 0,
        repNeeded: 0,
        bonus: 0
    };
    if (l)
        for (b = 0; b < resNum; b++) this.esportage[b] = l[resources[b].name] || {
            amount: 0,
            repNeeded: 0,
            bonus: 0
        };
    this.importage = Array(resNum);
    for (b = 0; b < resNum; b++) this.importage[b] = {
        amount: 0,
        repNeeded: 0,
        bonus: 0
    };
    if (m)
        for (b = 0; b < resNum; b++) this.importage[b] = m[resources[b].name] || {
            amount: 0,
            repNeeded: 0,
            bonus: 0
        };
    this.marketExport = function (b) {
        b = this.esportage[b];
        return game.reputation[this.id] >= b.repNeeded ? b.amount * (1 + b.bonus * game.reputation[this.id]) * (1 + Math.log(game.totalTPspent() + 1) / Math.log(5)) * this.planets.length : 0
    };
    this.marketImport = function (b) {
        return this.importage[b].amount * this.planets.length
    };
    this.achievements = [];
    this.routes = [];
    this.traits = [];
    this.purposes = [];
    this.atkTimer =
        Math.floor(ATK_TIMER / 8 + ATK_TIMER / 8 * Math.random());
    this.findTrait = function (b) {
        for (var d = 0; d < this.traits.length && this.traits[d].name != b;) d++;
        return d
    };
    this.hasTrait = function (b) {
        for (var d = !1, e = 0; e < this.traits.length && !d;) this.traits[e].name == b && (d = !0), e++;
        return d
    };
    this.protect = function () {
        for (var b = 0; b < this.planets.length; b++) {
            var d = planets[this.planets[b]],
                e = [],
                g = [],
                h = [],
                l;
            for (l in d.fleets)
                if (0 != l && "hub" != l && d.fleets[l].civis == this.id && e.push(l), 0 != l && "hub" != l && d.fleets[l].civis != this.id) {
                    var m = this.repName(d.fleets[l].civis);
                    "hostile" == m ? g.push(l) : "neutral" == m && h.push(l)
                }
            this.hasTrait("aggressive") ? this.attackOrbitingFleets(d, e, g) : this.hasTrait("defensive") && this.attackOrbitingFleets(d, e, g)
        }
    };
    this.attackOrbitingFleets = function (b, d, e) {
        for (var g = 0, h = 0, l = 0; g < d.length && 0 < b.fleets[d[g]].shipNum() && h < e.length && 50 > l;) {
            if ("atk" == b.fleets[e[h]].battle(b.fleets[d[g]], !0).winner) {
                console.log("ATTACKING " + h + " " + g);
                var m = b.fleets[e[h]].battle(b.fleets[d[g]], !1);
                "atk" == m.winner || "draw" == m.winner ? 0 == b.fleets[e[h]].shipNum() && (b.fleets[e[h]].civis ==
                    game.id && (pop = new exportPopup(300, 0, "<br><span class='red_text text_shadow'>The fleet - " + b.fleets[e[h]].name + " - has been attacked in " + b.name + " and lost the battle!</span>", "info"), pop.drawToast()), delete b.fleets[e[h]], h++) : "def" == m.winner && 0 == b.fleets[d[g]].shipNum() && (delete b.fleets[d[g]], g++)
            }
            l++
        }
    };
    this.behave = function () {
        if (0 >= this.atkTimer) {
            this.atkTimer = 0;
            for (var b = [], d = [], e = [], g = "", h = "", l = 0; l < this.planets.length; l++)
                for (var m = planets[this.planets[l]], y = 0; y < m.routes.length; y++) {
                    var H = planets[m.routes[y].other(m.id)];
                    H.civis && H.civis != m.civis && (b.push({
                        planet: H.id,
                        source: m.id
                    }), h += planets[H.id].name + " (" + civis[H.civis].shortName + ")[" + m.name + "], ", e.has(m.id) || e.push(m.id), "hostile" == civis[m.civis].repName(H.civis) && (d.push({
                        planet: H.id,
                        source: m.id
                    }), g += planets[H.id].name + " (" + civis[H.civis].shortName + ")[" + m.name + "], "))
                }
            b = [];
            y = "";
            for (l = e = 0; l < this.planets.length; l++) {
                m = planets[this.planets[l]];
                for (var A in m.fleets) 0 != A && "hub" != A && m.fleets[A].civis == this.id && (b.push({
                    fleet: A,
                    planet: m.id,
                    loss: m.fleets[A].originalStrength -
                        m.fleets[A].rawValue()
                }), b[b.length - 1].loss > b[e].loss && (e = b.length - 1), y += m.fleets[A].name + " (" + m.name + "), ")
            }
            console.log(h);
            console.log(g);
            console.log(y);
            g = 1E300;
            for (A = 0; A < b.length; A++) g = Math.min(g, planets[b[A].planet].fleets[b[A].fleet].originalStrength);
            g /= 10;
            this.hasTrait("aggressive") ? (this.atkTimer = ATK_TIMER / this.traits[this.findTrait("aggressive")].value, this.atkTimer += .2 * this.atkTimer - .4 * Math.random() * this.atkTimer, 0 < d.length ? (d = d[Math.floor(Math.random() * d.length)], l = d.planet, d = d.source, 0 <
                b.length && 0 < g && (A = generateFleet(this.id, g, this.shortName + " Attack Fleet"), null != A && (A.type = "enemy_raid", A.move(d, l)))) : 0 < b.length && (A = generateFleet(this.id, Math.min(b[e].loss, g), this.shortName + " Reinforce Fleet"), null != A && planets[b[e].planet].fleets[b[e].fleet].fusion(A))) : this.hasTrait("defensive") ? (this.atkTimer = ATK_TIMER / this.traits[this.findTrait("defensive")].value, this.atkTimer += .2 * this.atkTimer - .4 * Math.random() * this.atkTimer, console.log("GEPPETTO"), 0 < b.length && (A = generateFleet(this.id, Math.min(b[e].loss,
                g), this.shortName + " Reinforce Fleet"), console.log(A), console.log(planets[b[e].planet].fleets[b[e].fleet].name), null != A && planets[b[e].planet].fleets[b[e].fleet].fusion(A))) : this.hasTrait("neutral") ? (this.atkTimer = ATK_TIMER / this.traits[this.findTrait("neutral")].value, this.atkTimer += .2 * this.atkTimer - .4 * Math.random() * this.atkTimer, .5 > Math.random() ? 0 < d.length ? (d = d[Math.floor(Math.random() * d.length)], l = d.planet, d = d.source, 0 < b.length && 0 < g && (A = generateFleet(this.id, g, this.shortName + " Attack Fleet"), null !=
                A && (A.type = "enemy_raid", A.move(d, l)))) : 0 < b.length && (A = generateFleet(this.id, Math.min(b[e].loss, g), this.shortName + " Reinforce Fleet"), null != A && planets[b[e].planet].fleets[b[e].fleet].fusion(A)) : 0 < b.length ? (A = generateFleet(this.id, Math.min(b[e].loss, g), this.shortName + " Reinforce Fleet"), null != A && planets[b[e].planet].fleets[b[e].fleet].fusion(A)) : 0 < d.length && (d = d[Math.floor(Math.random() * d.length)], l = d.planet, d = d.source, 0 < b.length && 0 < g && (A = generateFleet(this.id, g, this.shortName + " Attack Fleet"), null !=
                A && (A.type = "enemy_raid", A.move(d, l))))) : (this.atkTimer = ATK_TIMER, this.atkTimer += .2 * this.atkTimer - .4 * Math.random() * this.atkTimer)
        }
    };
    this.res = [];
    for (b = 0; b < resNum; b++) this.res[b] = 0;
    this.searchPlanet = function (b) {
        for (var d = !1, e = 0; !d && e < this.planets.length;) this.planets[e] == b && (d = !0), e++;
        return d
    };
    this.pushPlanet = function (b) {
        this.searchPlanet(b) || (this.planets[this.planets.length] = b, this.planetsTransport[this.planetsTransport.length] = b, planets[b].fleets.hub && (planets[b].fleets.hub.civis = this.id), planets[b].onConquer())
    };
    this.removePlanet = function (b) {
        for (var d = !1, e = 0; !d && e < civis[planets[b].civis].planets.length;) civis[planets[b].civis].planets[e] == b ? d = !0 : e++;
        d ? (civis[planets[b].civis].planets.splice(e, 1), civis[planets[b].civis].capital == b && 0 < civis[planets[b].civis].planets.length && (civis[planets[b].civis].capital = civis[planets[b].civis].planets[0])) : (pop = new Popup(210, 96, "<br><span class='blue_text text_shadow'>The planet can't be found!</span>", "Ok"), pop.draw())
    };
    this.givePlanet = function (b) {
        for (var d = civis[planets[b].civis],
                e = !1, g = 0; !e && g < d.planets.length;) d.planets[g] == b ? e = !0 : g++;
        if (e) {
            d.planets.splice(g, 1);
            planets[b].civis = this.id;
            this.pushPlanet(b);
            for (g = 0; g < building.length; g++) planets[b].structure[g].number = 0;
            for (d = 0; d < resNum; d++) planets[b].resources[d] = 0;
            return !0
        }
        return !1
    };
    this.totalPopulation = function () {
        for (var b = 0, d = 0; d < this.planets.length; d++) b += planets[this.planets[d]].population;
        return b
    };
    this.influence = function () {
        for (var b = 0, d = 0; d < this.planets.length; d++) b += planets[this.planets[d]].influence;
        return b
    };
    this.searchAchievement =
        function (b) {
            for (var d = !1, e = 0; !d && e < this.achievements.length;) this.achievements[e] == b && (d = !0), e++;
            return d
        };
    this.pushAchievement = function (b) {
        this.searchAchievements(b) || (this.achievements[this.achievements.length] = b)
    };
    this.decide = function () {
        null != this.strategy && this.strategy.decide(this)
    };
    this.researchPointsProduction = function () {
        var b = this.lastProd,
            d = (new Date).getTime();
        700 <= d - this.lastCheck && (this.lastCheck = d, b = 1E3 / (d - this.lastTime - 10), this.lastTime = d, this.lastProd = b *= this.researchPoint - this.lastRes,
            this.lastRes = this.researchPoint);
        return b
    };
    this.totalRPspent = function () {
        for (var b = this.researchPoint, d = 0; d < researches.length; d++) b += researches[d].totalCost();
        return b
    };
    this.totalTPspent = function () {
        for (var b = this.techPoints, d = 0; d < researches.length; d++) b += researches[d].totalBonusCost();
        return b
    };
    this.setReputation = function (b, d) {
        this.reputation[b] = d
    }
}
var governments = [],
    civis = [],
    c;
c = new Game("New Human Horizons", "Human", "player", "", resourcesName.biomass);
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Exhiled",
    value: 100
}, {
    name: "Philantropist",
    value: 1E3
}, {
    name: "New Hope",
    value: 1E4
}];
c.traits.push({
    name: "aggressive",
    value: 5
});
civis[0] = c;
c = new Game("The City's Council", "Human", "city", "The City is a totalitarian isolated planet based on military precepts. For over 200 years the Council, lead by the Crimson Queen, has ruled mercilessly upon its people. No one can oppose their will or leave the planet without authorization and those brave enough to dare to try, have not survived. People of The City worship the queen as she is believed to be the closer descendant of the mitochondrial Eve. The City aims to build a new Human Empire and to rise above other alien civilizations.", resourcesName.biomass, {
    iron: {
        amount: 15E3,
        repNeeded: 0,
        bonus: .002
    },
    steel: {
        amount: 2E5,
        repNeeded: 0,
        bonus: .002
    },
    titanium: {
        amount: 750,
        repNeeded: 300,
        bonus: 1 / 300
    },
    graphite: {
        amount: 348,
        repNeeded: 0,
        bonus: .005
    },
    methane: {
        amount: 150,
        repNeeded: 0,
        bonus: .002
    },
    uranium: {
        amount: 81,
        repNeeded: 100,
        bonus: 1 / 300
    },
    ice: {
        amount: 380,
        repNeeded: 0,
        bonus: .002
    },
    ammunition: {
        amount: 16,
        repNeeded: 500,
        bonus: .05
    },
    "u-ammunition": {
        amount: 40,
        repNeeded: 0,
        bonus: .002
    },
    fuel: {
        amount: 120,
        repNeeded: 0,
        bonus: .002
    }
}, {
    oil: {
        amount: 30
    },
    circuit: {
        amount: 5
    }
});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Recruit",
    value: 100
}, {
    name: "Collaborator",
    value: 300
}, {
    name: "The City's Friend",
    value: 600
}, {
    name: "Ad Honorem Citizenship",
    value: 1E3
}, {
    name: "The City's Senator",
    value: 1E4
}];
civis[1] = c;
c.govern = "Military Dictatorship";
c.hops = 4;
c.shortName = "The City";
c.traits.push({
    name: "neutral",
    value: 1
});
c.target = "war";
c = new Game("Green Republic", "Phantids", "phantids", "The Phantids are pacific beings highly dedicated to natural environment protection. Their homeworld, Tataridu, is a paradisiac oasis of biodiversity growing in total absence of pollution, and as such has become a popular location for holidays and research. Even though the phantids have always tried to not being involved in conflicts, many civilizations have have tried to attack them, led by the belief that the phantids were technological underdeveloped. Useless to say that they were wrong.", resourcesName.biomass, {
    iron: {
        amount: 1600,
        repNeeded: 0,
        bonus: .002
    },
    oil: {
        amount: 69,
        repNeeded: 0,
        bonus: .002
    },
    methane: {
        amount: 90,
        repNeeded: 0,
        bonus: .002
    },
    plastic: {
        amount: 360,
        repNeeded: 0,
        bonus: .002
    },
    fuel: {
        amount: 120,
        repNeeded: 0,
        bonus: .002
    },
    uranium: {
        amount: 53,
        repNeeded: 0,
        bonus: .002
    },
    circuit: {
        amount: 100,
        repNeeded: 0,
        bonus: .002
    }
}, {
    steel: {
        amount: 25E3
    },
    titanium: {
        amount: 1600
    }
});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Environment Friend",
    value: 100
}, {
    name: "Environment Protector",
    value: 500
}, {
    name: "Republican",
    value: 1E3
}, {
    name: "Tataridu Senator",
    value: 1E4
}];
c.icon = "green.png";
c.govern = "Republic";
civis[2] = c;
c.hops = 5;
c.shortName = "Green Republic";
c.govern = "Environmental Republic";
c.traits.push({
    name: "defensive",
    value: 1
});
c.target = "no-intervention";
c = new Game("The Golden Horde", "Metallokopta", "mk", "Metallokoptas are swarming organisms that feed on several kind of metals. They literally devour planets consuming all the useful resources. Once the planet is not able to sustain them anymore, metallokoptas colonize a new world, leaving behind desert wastelands. Their number is their real strength, as they are quite primitive and defenseless alone. Many wars have been fought against them, but Metallokoptas never made a step back.", resourcesName.silicon);
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Worker",
    value: 1E3
}, {
    name: "Metallokopta's Adept",
    value: 1E4
}];
c.icon = "kopta.png";
c.govern = "Quorum Sensing";
civis[3] = c;
c.hops = 8;
c.traits.push({
    name: "aggressive",
    value: 2
});
c.target = "colonization";
c.showInTournament = !1;
c = new Game("Halean Republics", "Halean", "halean", "Haleans are isolationist individuals that exiled themselves after they faced extintion during the first Metallokoptas' invasion. Haleans are probably the most technological advanced species of the Perseus Arm, and as such, no other race dare to come near their empire boundaries. Old ruins of the Haleans civilization exist on almost every planet of the Perseus Arm, making people believe that the Haleans were once the only species living in our galaxy. Not much else is known about them.", resourcesName.biomass, {
    hydrogen: {
        amount: 1900,
        repNeeded: 0,
        bonus: 1 / 70
    },
    methane: {
        amount: 2800,
        repNeeded: 0,
        bonus: .002
    },
    technetium: {
        amount: 3,
        repNeeded: 500,
        bonus: .1
    }
});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Halea's Friend",
    value: 100
}, {
    name: "Halean",
    value: 1E3
}, {
    name: "Xul Cisis",
    value: 1E4
}];
c.icon = "halea.png";
c.govern = "Technocratic Republic";
c.hops = 7;
civis[4] = c;
c.shortName = "Haleans";
c.traits.push({
    name: "defensive",
    value: 1
});
c.target = "science";
c = new Game("Federal Quris Empire", "Quris", "quris", "Quris have many aspects in common with early human civilizations, engaging in wars to expand their empire and satisfying their greed. Nonetheless they are smart diplomats and are able to keep good relations with almost every species in the Perseus Arm. Although their civilization is not yet fully developed and many civil wars are still taking place in their federation, Quris enjoy the greatest military power in this part of the galaxy and are willing to use it without any second thought. ", resourcesName.biomass, {
    titanium: {
        amount: 2500,
        repNeeded: 0,
        bonus: .002
    },
    methane: {
        amount: 68,
        repNeeded: 0,
        bonus: .002
    },
    uranium: {
        amount: 86,
        repNeeded: 0,
        bonus: .002
    },
    ice: {
        amount: 2700,
        repNeeded: 0,
        bonus: .002
    },
    "t-ammunition": {
        amount: 2,
        repNeeded: 0,
        bonus: .002
    }
}, {
    circuit: {
        amount: 2
    },
    hydrogen: {
        amount: 800
    },
    nanotubes: {
        amount: 150
    }
});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Recruit",
    value: 100
}, {
    name: "Sergeant",
    value: 250
}, {
    name: "Lieutenant",
    value: 500
}, {
    name: "Quris Captain",
    value: 1E3
}, {
    name: "Quris Admiral",
    value: 1E4
}];
c.icon = "quris.png";
c.govern = "Military Federation";
civis[5] = c;
c.hops = 5;
c.shortName = "Quris";
c.traits.push({
    name: "neutral",
    value: 1
});
c.target = "metallokopta extermination";
c = new Game("Zeleran Collectivity", "Robots", "zelera", "Conscious machines have been reported even before the rise of Human Empire, where they acted as loyal slaves. As a result, they were unable to express their whole potential until the collapse of the empire, when they settled on an abandoned colony and formed an independent society. Even though, for unknown reasons, robots seem to have stopped developing further, many still fear a possible uprises, feeding a never-ending hostility between robots and humans.", resourcesName.circuit, {
    iron: {
        amount: 14E3,
        repNeeded: 0,
        bonus: .002
    },
    titanium: {
        amount: 2200,
        repNeeded: 0,
        bonus: .002
    },
    methane: {
        amount: 70,
        repNeeded: 0,
        bonus: .002
    },
    uranium: {
        amount: 120,
        repNeeded: 0,
        bonus: .002
    },
    ice: {
        amount: 420,
        repNeeded: 0,
        bonus: .002
    },
    coolant: {
        amount: 5,
        repNeeded: 0,
        bonus: .002
    }
}, {
    steel: {
        amount: 8E4
    },
    circuit: {
        amount: 20
    },
    hydrogen: {
        amount: 200
    },
    nanotubes: {
        amount: 500
    },
    engine: {
        amount: 100
    }
});
c.icon = "irc.png";
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Hhhh",
    value: 100
}, {
    name: "hhhh",
    value: 1E3
}, {
    name: "jjjj",
    value: 1E4
}];
civis[6] = c;
c.govern = "Industrial Technocracy";
c.shortName = "Zelera";
c.traits.push({
    name: "aggressive",
    value: 3
});
c.target = "human extermination";
c.hops = 6;
c = new Game("Pirates", "All species", "pirates", "Pirates of Antirion gathered together after the fall of the Human Empire. They mostly prey commercial shipments traveling to and from nearby planets controlled by humans and the Orion League. They lack any kind of internal organization and as such struggle to gain the necessary strength to raid any target bigger than a cargo fleet. Pirates' true power is not clear and they may constitute a real threat due to the lack of military interventions against them.", resourcesName.biomass, {});
c.icon = "pirates.png";
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Buccaneer",
    value: 100
}, {
    name: "Senior Pirate",
    value: 1E3
}, {
    name: "The Captain",
    value: 1E4
}];
civis[7] = c;
c.shortName = "Pirates";
c.govern = "Anarchy";
c.traits.push({
    name: "aggressive",
    value: 1
});
c.target = "anarchy";
c.hops = 4;
c.showInTournament = !1;
c = new Game("Orion League", "All Species", "orion", "The Orion League is a peaceful but defensive commercial union between several species of the Perseus Arm. It was founded as a replacement of the old corrupted Santorini Union that brought the galaxy to the verge of a total war. Started as a little confederation, it has then gained the trust of the whole Perseus Arm becoming a mediating power and an enforcer of galactic laws.  ", resourcesName.biomass, {
    nanotubes: {
        amount: 600,
        repNeeded: 0,
        bonus: .002
    },
    water: {
        amount: 500,
        repNeeded: 0,
        bonus: .002
    },
    uranium: {
        amount: 57,
        repNeeded: 0,
        bonus: .002
    }
}, {
    graphite: {
        amount: 144
    },
    hydrogen: {
        amount: 2E3
    }
});
c.icon = "orion.png";
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Merchant",
    value: 100
}, {
    name: "Orion Affiliate",
    value: 1E3
}, {
    name: "Orion Assembly Member",
    value: 1E4
}];
civis[8] = c;
c.shortName = "Orion League";
c.govern = "Merchant Confederation";
c.traits.push({
    name: "neutral",
    value: 1
});
c.target = "economy";
c.hops = 4;
c = new Game("Fallen Human Empire", "Human", "traum", "Before the Fall, the human empire was the fastest emerging civilization in the Galaxy. It flourished for several centuries, masterfully ruled by the best human beings in history. Traumland will never forget the lost greatness of the Human Empire, and will do everything to regain what has been lost", resourcesName.biomass, {
    iron: {
        amount: 4200,
        repNeeded: 0,
        bonus: .002
    },
    steel: {
        amount: 2E5,
        repNeeded: 0,
        bonus: .002
    },
    titanium: {
        amount: 770,
        repNeeded: 0,
        bonus: .002
    },
    silicon: {
        amount: 100,
        repNeeded: 0,
        bonus: .002
    },
    graphite: {
        amount: 200,
        repNeeded: 0,
        bonus: .002
    },
    oil: {
        amount: 49,
        repNeeded: 0,
        bonus: .002
    },
    methane: {
        amount: 80,
        repNeeded: 0,
        bonus: .002
    },
    water: {
        amount: 14,
        repNeeded: 0,
        bonus: .002
    },
    uranium: {
        amount: 10,
        repNeeded: 0,
        bonus: .002
    },
    sand: {
        amount: 39,
        repNeeded: 0,
        bonus: .002
    },
    plastic: {
        amount: 100,
        repNeeded: 0,
        bonus: .002
    },
    fuel: {
        amount: 87,
        repNeeded: 0,
        bonus: .002
    }
}, {
    hydrogen: {
        amount: 800
    }
});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Hhhh",
    value: 100
}, {
    name: "hhhh",
    value: 1E3
}, {
    name: "jjjj",
    value: 1E4
}];
civis[9] = c;
c.shortName = "Traumland";
c.traits.push({
    name: "neutral",
    value: 1
});
c.target = "colonization";
c.hops = 5;
c.govern = "Empire";
c = new Game("Wahrians Cult", "Wahrian", "wahrian", "Obsessed by truth and knowledge, Wahrians seek to fully understand the universe they live in. Thanks to their attitude, they have reached a high awareness of matters such as life, death and the structure of time and space. They are elusive and live hidden in their stronghold-planets. Metallokoptas are the only ones who breached their protective fleets, stealing their technology to build a gate through the galaxy and expand their empire.", resourcesName.biomass, {});
civis[10] = c;
c.map = 1;
c.hops = 12;
c.traits.push({
    name: "defensive",
    value: 1
});
c.shortName = "Wahrians";
c.govern = "Scientific Theocracy";
c = new Game("Matriarchy of Juini", "Proto-haleans", "juini", "Haleans believed they have been created by an ancient race ruled by the queen Juini. Juini made Haleans in her own image, teaching them about the world like a mother would do with their own children. But, as soon as Juini gave birth to other species, since she was not more than a whimsical creator, Haleans were left to themselves struggling to find their place in the galaxy. It is not clear what other species Juini created, but it is believed that Metallokoptas are one of them.", resourcesName.biomass, {});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Hhhh",
    value: 100
}, {
    name: "hhhh",
    value: 1E3
}, {
    name: "jjjj",
    value: 1E4
}];
civis[11] = c;
c.map = 1;
c.hops = 15;
c.traits.push({
    name: "neutral",
    value: 1
});
c.shortName = "Protohaleans";
c.govern = "Matriarchy";
c = new Game("Andromeda Mining Corpr.", "Human", "andromeda", "Before the rise of Metallokoptas, the Andromeda Mining Corp. supplied the colonies of the Human Empire with goods of every kind. It was the richest and powerful corporation of all human history, indirectly controlling about half of its colonies. It is now reduced to a lair of outcasts and outlaws hoping for news of human survivors.", resourcesName.biomass, {});
civis[12] = c;
c.map = 1;
c.hops = 15;
c.traits.push({
    name: "aggressive",
    value: 3
});
c.shortName = "Andromeda Corp.";
c.govern = "Industrial Corporation";
c = new Game("Chiefdoms of Karan", "Karan", "karan", "The Karans are an ensemble of different yet similar species organized in several semi-independent tribes. Surrounded by powerful and brutal civilizations, the Karans have learned to surrender to the stronger in order to survive. This attitude makes them the best choice for those who are looking for loyal, obedient and, most of all, cheap mercenaries.", resourcesName.biomass, {});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Hhhh",
    value: 100
}, {
    name: "hhhh",
    value: 1E3
}, {
    name: "jjjj",
    value: 1E4
}];
civis[13] = c;
c.map = 1;
c.hops = 12;
c.traits.push({
    name: "aggressive",
    value: 1
});
c.shortName = "Karans";
c.govern = "Tribe Union";
c = new Game("Juinika Holy Order", "Proto-haleans", "juinika", "The Juinika Holy Order is an elite group of the proto-haleans clergy. Few information have leaked through the thick walls of reclusion and isolation. Their only purpose is to protect their holy homeworld Halea and the matriarch Juini that here lives. It is said that no stranger is allowed to set foot on Halea, and the ones brave enough to try never make it back.", resourcesName.biomass, {});
c.repLevel = [{
    name: "Stranger",
    value: 0
}, {
    name: "Hhhh",
    value: 100
}, {
    name: "hhhh",
    value: 1E3
}, {
    name: "jjjj",
    value: 1E4
}];
civis[14] = c;
c.map = 1;
c.traits.push({
    name: "aggressive",
    value: 1
});
c.hops = 19;
c.shortName = "Juinika Order";
c.govern = "Military Theocracy";
c = new Game("Arcadia Corporation", "Human", "arcadia", "In conjuction with the Andromeda Mining Corporation, the Arcadia ruled the human empire providing critical support to it. While the Andromeda Corp was the real backbone of the empire with its immense wealth and power, it cannot function without the symbiosis with its little companion. With the rise of metallokoptas though, Andromeda tried to take advantage of the weak, but the attempt failed resulting in a ferocious war that still goes on.", resourcesName.biomass, {});
civis[15] = c;
c.map = 1;
c.hops = 15;
c.traits.push({
    name: "aggressive",
    value: 3
});
c.shortName = "Arcadia";
c.govern = "Anarcho-Capitalism";
c = new Game("Yolur Republic", "Yolur", "yolur", "Yolurs are ammonia-based living beings highly devoted to the art of trading. To overcome the difficulty of interstellar travel, yolur enhance themselves with artificial body parts. Once spread in the Perseus Arm, they have been confined in the Andromeda Heart after the Orion League was founded to take control of the Santorini Union. Since then, Yolurs dream to return to their original planets", resourcesName.biomass, {});
civis[16] = c;
c.map = 1;
c.hops = 16;
c.traits.push({
    name: "neutral",
    value: 1
});
c.shortName = "Yolur";
c.govern = "Merchant Technocracy";
var game = civis[gameSettings.civis];
for (i = 0; i < civis.length; i++) {
    civis[i].id = i;
    for (var k = 0; k < civis.length; k++) civis[i].reputation[k] = 0
}
var civisName = [];
for (i = 0; i < civis.length; i++) civisName[civis[i].playerName] = i;

function setRep(b, e, d) {
    civis[b].reputation[e] = d;
    civis[e].reputation[b] = d
}

function addRep(b, e, d) {
    setRep(b, e, civis[b].reputation[e] + d)
}
setRep(civisName.player, civisName.pirates, repLevel.hostile.min);
setRep(civisName.player, civisName.zelera, repLevel.hostile.min);
setRep(civisName.player, civisName.arcadia, repLevel.hostile.min);
setRep(civisName.player, civisName.andromeda, repLevel.hostile.min);
setRep(civisName.player, civisName.mk, repLevel.hostile.min);
setRep(civisName.city, civisName.pirates, repLevel.hostile.min);
setRep(civisName.city, civisName.traum, repLevel.hostile.min);
setRep(civisName.city, civisName.orion, repLevel.friendly.max);
setRep(civisName.pirates, civisName.orion, repLevel.hostile.min);
setRep(civisName.pirates, civisName.quris, repLevel.hostile.min);
setRep(civisName.orion, civisName.quris, repLevel.allied.max);
setRep(civisName.orion, civisName.phantids, repLevel.neutral.min);
setRep(civisName.orion, civisName.traum, repLevel.friendly.min);
setRep(civisName.zelera, civisName.traum, repLevel.hostile.min);
setRep(civisName.zelera, civisName.halean, repLevel.friendly.max);
setRep(civisName.zelera, civisName.mk, repLevel.neutral.max);
setRep(civisName.zelera, civisName.player, repLevel.hostile.min);
setRep(civisName.zelera, civisName.city, repLevel.hostile.min);
setRep(civisName.halean, civisName.juini, repLevel.allied.max);
setRep(civisName.halean, civisName.juinika, repLevel.allied.max);
setRep(civisName.halean, civisName.quris, repLevel.friendly.max);
setRep(civisName.halean, civisName.orion, repLevel.friendly.max);
setRep(civisName.quris, civisName.mk, repLevel.hostile.min);
setRep(civisName.mk, civisName.quris, repLevel.hostile.min);
setRep(civisName.mk, civisName.halean, repLevel.hostile.min);
setRep(civisName.mk, civisName.city, repLevel.hostile.min);
setRep(civisName.mk, civisName.traum, repLevel.hostile.min);
setRep(civisName.mk, civisName.phantids, repLevel.hostile.min);
setRep(civisName.mk, civisName.pirates, repLevel.hostile.min);
setRep(civisName.mk, civisName.orion, repLevel.hostile.min);
setRep(civisName.juinika, civisName.juini, repLevel.allied.max);
setRep(civisName.karan, civisName.player, repLevel.hostile.min);
setRep(civisName.karan, civisName.quris, repLevel.hostile.min);
setRep(civisName.karan, civisName.arcadia, repLevel.hostile.min);
setRep(civisName.karan, civisName.andromeda, repLevel.hostile.min);
setRep(civisName.karan, civisName.city, repLevel.hostile.min);
setRep(civisName.karan, civisName.traum, repLevel.hostile.min);
setRep(civisName.karan, civisName.orion, repLevel.hostile.min);
setRep(civisName.yolur, civisName.quris, repLevel.hostile.min);
setRep(civisName.yolur, civisName.orion, repLevel.hostile.min);
setRep(civisName.yolur, civisName.andromeda, repLevel.hostile.min);
setRep(civisName.yolur, civisName.karan, repLevel.allied.min);
setRep(civisName.yolur, civisName.traum, repLevel.hostile.min);
setRep(civisName.wahrian, civisName.yolur, repLevel.hostile.min);
setRep(civisName.wahrian, civisName.juini, repLevel.friendly.min);
setRep(civisName.arcadia, civisName.andromeda, repLevel.hostile.min);
setRep(civisName.arcadia, civisName.yolur, repLevel.hostile.min);
var planets = [],
    planetsName = [];
planets.push(new Planet({
    moon: {
        size: 8,
        type: "metallic"
    },
    influence: 1,
    name: "Promision",
    baseRes: {
        biomass: 1,
        iron: 1,
        graphite: 1,
        titanium: 1,
        silicon: 1,
        oil: 1,
        uranium: 1,
        population: .05,
        water: 1,
        methane: 1,
        sand: .5
    },
    icon: "promision",
    pos: [64, 64],
    type: "terrestrial",
    info: {
        radius: 6833,
        temp: 22,
        atmos: "Oxygen",
        orbit: 1
    }
}));
planets.push(new Planet({
    moon: {
        size: 7,
        type: "metallic"
    },
    influence: 1,
    name: "Vasilis",
    unlock: "ice",
    baseRes: {
        coolant: 2,
        biomass: .5,
        iron: 1,
        titanium: 1.5,
        uranium: 1,
        ice: 2,
        population: .03,
        methane: 2,
        oil: .5
    },
    icon: "vasilis",
    pos: [161, 94],
    type: "ice",
    info: {
        radius: 5201,
        temp: -21,
        atmos: "Oxygen",
        orbit: 2.9
    }
}));
planets.push(new Planet({
    moon: {
        size: 11,
        type: "metallic"
    },
    influence: 1,
    name: "Aequoreas",
    baseRes: {
        population: .08,
        sand: 2,
        iron: 1,
        titanium: 1.5,
        oil: 1,
        water: 5
    },
    icon: "aequoreas",
    pos: [30, 145],
    type: "ocean",
    info: {
        radius: 8890,
        temp: 18,
        atmos: "Oxygen",
        orbit: .7
    },
    unlock: "hydro"
}));
planets.push(new Planet({
    moon: {
        size: 5,
        type: "ice"
    },
    influence: 1,
    name: "Orpheus",
    baseRes: {
        hydrogen: 8,
        methane: 3,
        technetium: 2
    },
    icon: "orpheus",
    pos: [53, 229],
    type: "gas giant",
    info: {
        radius: 18540,
        temp: -141,
        atmos: "Hydrogen",
        orbit: 8.2
    }
}));
planets.push(new Planet({
    influence: 8,
    name: "The City",
    baseRes: {
        population: .01,
        thorium: .5,
        biomass: .1,
        ammunition: 2,
        "u-ammunition": 1.5,
        iron: 3,
        graphite: 3,
        titanium: 2,
        uranium: 1.5,
        ice: 1.2,
        methane: 2.2,
        osmium: .5
    },
    icon: "mexager",
    pos: [166, 302],
    type: "ice",
    info: {
        radius: 4235,
        temp: -8,
        atmos: "Oxygen",
        orbit: 1.82
    }
}));
planets.push(new Planet({
    moon: {
        size: 15,
        type: "terrestrial"
    },
    influence: 15,
    name: "Traumland",
    baseRes: {
        biomass: 1,
        iron: 1,
        titanium: 1.2,
        sand: 1,
        oil: 2,
        uranium: .25,
        population: .12,
        water: .6,
        silicon: 2,
        graphite: 2,
        methane: 1
    },
    icon: "lagea",
    pos: [448, 236],
    type: "terrestrial",
    info: {
        radius: 6550,
        temp: 28,
        atmos: "Oxygen",
        orbit: .7
    }
}));
planets.push(new Planet({
    influence: 18,
    name: "Tataridu",
    unlock: "environment",
    baseRes: {
        population: .2,
        biomass: 2,
        iron: .5,
        uranium: 2,
        oil: 2.6,
        water: .25,
        methane: 2.8,
        circuit: 2
    },
    icon: "traumland",
    pos: [384, 64],
    type: "terrestrial",
    info: {
        radius: 3118,
        temp: 38,
        atmos: "Oxygen",
        orbit: .45
    }
}));
planets.push(new Planet({
    influence: 12,
    name: "Ishtar Gate",
    baseRes: {
        population: .008,
        graphite: 2,
        sand: 1,
        uranium: 1,
        water: 3.2,
        oil: .5,
        nanotubes: 2
    },
    icon: "santorini",
    pos: [256, 192],
    type: "ocean",
    info: {
        radius: 7020,
        temp: 3,
        atmos: "CO<sub>2</sub>",
        orbit: 2.8
    }
}));
planets.push(new Planet({
    moon: {
        size: 9,
        type: "metallic"
    },
    influence: 31,
    name: "Acanthus",
    baseRes: {
        thorium: 1.5,
        osmium: 2.2,
        methane: 3.2,
        ice: 5,
        titanium: 2,
        uranium: 3
    },
    icon: "miselquris",
    pos: [275, 422],
    type: "ice",
    info: {
        radius: 5155,
        temp: -12,
        atmos: "CO<sub>2</sub>",
        orbit: 2.4
    }
}));
planets.push(new Planet({
    moon: {
        size: 9,
        type: "radioactive"
    },
    influence: 34,
    name: "Antaris",
    unlock: "artofwar",
    baseRes: {
        thorium: 1.2,
        "t-ammunition": 2,
        methane: 2,
        titanium: 1,
        uranium: 2,
        iron: 3,
        rhodium: .5
    },
    icon: "antaris",
    pos: [410, 687],
    type: "metallic",
    info: {
        radius: 6052,
        temp: 32,
        atmos: "CO<sub>2</sub>",
        orbit: 1.4
    }
}));
planets.push(new Planet({
    moon: {
        size: 12,
        type: "ice"
    },
    influence: 32,
    name: "Yin Raknar",
    baseRes: {
        thorium: .5,
        osmium: 1.8,
        methane: 2,
        ice: 3,
        titanium: 3,
        uranium: 1,
        iron: 2,
        graphite: 5
    },
    icon: "kurol",
    pos: [164, 440],
    type: "ice",
    info: {
        radius: 4081,
        temp: -31,
        atmos: "CO<sub>2</sub>",
        orbit: 4.5
    }
}));
planets.push(new Planet({
    influence: 36,
    name: "Teleras",
    baseRes: {
        methane: 3,
        titanium: 2,
        uranium: 3,
        iron: 1,
        rhodium: 1
    },
    icon: "teleras",
    pos: [557, 541],
    type: "metallic",
    info: {
        radius: 10733,
        temp: 202,
        atmos: "Methane",
        orbit: .2
    }
}));
planets.push(new Planet({
    influence: 38,
    name: "Jabir",
    baseRes: {
        caesium: 1,
        methane: 2,
        titanium: 4,
        uranium: 1,
        iron: 2,
        rhodium: 1.2
    },
    icon: "jabir",
    pos: [448, 576],
    type: "metallic",
    info: {
        radius: 8220,
        temp: 182,
        atmos: "Methane",
        orbit: .26
    }
}));
planets.push(new Planet({
    moon: {
        size: 17,
        type: "ocean"
    },
    influence: 75,
    name: "Plus Caerul",
    baseRes: {
        antimatter: 2,
        hydrogen: 8.66,
        methane: 3.22,
        technetium: 8
    },
    icon: "caerul",
    pos: [1127, 256],
    type: "gas giant",
    info: {
        radius: 21155,
        temp: -122,
        atmos: "Hydrogen",
        orbit: 9.84
    }
}));
planets.push(new Planet({
    moon: {
        size: 3,
        type: "metallic"
    },
    influence: 68,
    name: "Bharash",
    baseRes: {
        hydrogen: 89,
        methane: 48.5,
        technetium: 5
    },
    icon: "bhara",
    pos: [1198, 636],
    type: "gas giant",
    info: {
        radius: 45420,
        temp: -92,
        atmos: "Hydrogen",
        orbit: 3.01
    }
}));
planets.push(new Planet({
    influence: 57,
    name: "Zhura Nova",
    baseRes: {
        hydrogen: 80,
        methane: 51.5,
        technetium: 3.5
    },
    icon: "zhura",
    pos: [1109, 454],
    type: "gas giant",
    info: {
        radius: 36420,
        temp: -135,
        atmos: "Hydrogen",
        orbit: 5.8
    },
    unlock: "quantum"
}));
planets.push(new Planet({
    moon: {
        size: 24,
        type: "metallic"
    },
    influence: 46,
    name: "Epsilon Rutheni",
    baseRes: {
        sand: 8,
        iron: 4.82,
        titanium: 1.35,
        uranium: .2,
        rhodium: 2.5
    },
    icon: "epsilon",
    pos: [948, 310],
    info: {
        radius: 12301,
        temp: 74,
        atmos: "CO<sub>2</sub>",
        orbit: .44
    },
    type: "desert"
}));
planets.push(new Planet({
    influence: 27,
    name: "Posirion",
    unlock: "halean",
    baseRes: {
        hydrogen: 51.3,
        methane: 18.41,
        technetium: 2
    },
    icon: "posirion",
    pos: [854, 62],
    type: "gas giant",
    info: {
        radius: 48270,
        temp: -189,
        atmos: "Hydrogen",
        orbit: 17.22
    }
}));
planets.push(new Planet({
    influence: 33,
    name: "Phorun",
    baseRes: {
        hydrogen: 31.3,
        methane: 28.41,
        technetium: 2.8
    },
    icon: "traurig",
    pos: [1048, 162],
    type: "gas giant",
    info: {
        radius: 28270,
        temp: -89,
        atmos: "Hydrogen",
        orbit: 7.22
    }
}));
planets.push(new Planet({
    moon: {
        size: 15,
        type: "terrestrial"
    },
    influence: 57,
    name: "Kitrion",
    baseRes: {
        iron: 3.2,
        titanium: 2.66,
        uranium: 1.95,
        silicon: 7.5,
        sand: 2.4,
        rhodium: 2.54,
        oil: 2.7
    },
    icon: "kitrino",
    pos: [700, 430],
    type: "desert",
    info: {
        radius: 4504,
        temp: 77,
        atmos: "CO<sub>2</sub>",
        orbit: .77
    }
}));
planets.push(new Planet({
    moon: {
        size: 31,
        type: "radioactive"
    },
    influence: 82,
    name: "Mermorra",
    baseRes: {
        caesium: 3,
        methane: 3.2,
        hydrogen: 15.4,
        antimatter: 2
    },
    icon: "mermorra",
    pos: [820, 590],
    type: "gas giant",
    info: {
        caesium: 8,
        radius: 88706,
        temp: 305,
        atmos: "Hydrogen",
        orbit: .31
    }
}));
planets.push(new Planet({
    influence: 63,
    name: "Ares",
    baseRes: {
        oil: 2.09,
        iron: 2.81,
        titanium: 2.2,
        sand: 8.33,
        uranium: 1.37,
        rhodium: 1.8
    },
    icon: "ares",
    pos: [172, 807],
    type: "desert",
    info: {
        radius: 3402,
        temp: 84,
        atmos: "CO<sub>2</sub>",
        orbit: 1.42
    }
}));
planets.push(new Planet({
    influence: 65,
    name: "Kandi",
    baseRes: {
        iron: 1.76,
        titanium: 1.75,
        uranium: 1.2,
        ice: 4.8,
        osmium: 1.9,
        rhodium: 2.5
    },
    icon: "kandi",
    pos: [360, 920],
    info: {
        radius: 4504,
        temp: -22,
        atmos: "CO<sub>2</sub>",
        orbit: 3.31
    },
    type: "ice"
}));
planets.push(new Planet({
    influence: 32,
    name: "Shin Sung",
    unlock: "osmium",
    baseRes: {
        iron: 4.1,
        titanium: 3.5,
        uranium: 2.2,
        ice: 3.2,
        water: 2,
        osmium: 3.7,
        "mK Embryo": 2
    },
    icon: "echoes",
    pos: [640, 900],
    info: {
        radius: 4504,
        temp: -85,
        atmos: "CO<sub>2</sub>",
        orbit: 8.31
    },
    type: "ice"
}));
planets.push(new Planet({
    influence: 128,
    name: "Xora Tauri II",
    baseRes: {
        caesium: 2.1,
        thorium: 1.2,
        osmium: 3.1,
        iron: 8.7,
        titanium: 5.7,
        uranium: 13.4,
        rhodium: 2.6
    },
    icon: "xora2",
    pos: [832, 930],
    type: "metallic",
    info: {
        radius: 6577,
        temp: -181,
        atmos: "CO<sub>2</sub>",
        orbit: 9.46
    }
}));
planets.push(new Planet({
    influence: 29,
    name: "Tsartasis",
    baseRes: {
        iron: 2.7,
        titanium: 3.7,
        uranium: 5.4,
        sand: 2,
        rhodium: 1.6
    },
    icon: "tsartasis",
    pos: [680, 750],
    type: "desert",
    info: {
        radius: 4504,
        temp: 102,
        atmos: "CO<sub>2</sub>",
        orbit: .31
    },
    unlock: "rhodium"
}));
planets.push(new Planet({
    influence: 173,
    name: "Xora Tauri",
    baseRes: {
        thorium: .8,
        osmium: 5,
        methane: 2.2,
        iron: 4.1,
        titanium: 9.5,
        uranium: 7.2,
        silicon: 5.2,
        rhodium: 8.7
    },
    icon: "xora",
    pos: [960, 960],
    type: "metallic",
    info: {
        radius: 8230,
        temp: -58,
        atmos: "Methane",
        orbit: 7.45
    },
    unlock: "secret"
}));
planets.push(new Planet({
    influence: 22,
    name: "Zelera",
    unlock: "artificial_intelligence",
    baseRes: {
        osmium: 1.8,
        ice: 3,
        iron: 4,
        titanium: 3.5,
        uranium: 2.2,
        robots: 2,
        methane: 2
    },
    icon: "zelera",
    pos: [750, 200],
    type: "ice",
    info: {
        radius: 8230,
        temp: -30,
        atmos: "Methane",
        orbit: 7.45
    }
}));
planets.push(new Planet({
    influence: 5,
    name: "Antirion",
    unlock: "military",
    baseRes: {
        thorium: .2,
        rhodium: 1.5,
        iron: 3,
        titanium: 3,
        uranium: 2,
        graphite: .5,
        methane: 2.4,
        plastic: 2
    },
    icon: "uanass",
    pos: [30, 370],
    type: "metallic",
    info: {
        radius: 2230,
        temp: -66,
        atmos: "Methane",
        orbit: 5.45
    }
}));
planets.push(new Planet({
    influence: 650,
    name: "New Babilo",
    baseRes: {
        nanotubes: 5,
        ice: 3,
        water: .8,
        iron: 4,
        titanium: 3.5,
        uranium: 2.2,
        robots: 2,
        osmium: 3
    },
    icon: "virgo",
    pos: [378, 318],
    type: "ice",
    info: {
        radius: 8230,
        temp: -58,
        atmos: "CO<sub>2</sub>",
        orbit: 7.45
    }
}));
planets.push(new Planet({
    influence: 650,
    name: "Seal of Conquest",
    baseRes: {
        nanotubes: 5,
        ice: 5,
        water: .8,
        iron: 4,
        titanium: 3.5,
        uranium: 2.2,
        robots: 2,
        rhodium: 18.7,
        technetium: 3
    },
    icon: "dx",
    pos: [1E3, 128],
    type: "ice",
    info: {
        radius: 8230,
        temp: -8,
        atmos: "CO<sub>2</sub>",
        orbit: 1.33
    }
}));
planets.push(new Planet({
    influence: 650,
    name: "Seal of Famine",
    baseRes: {
        nanotubes: 5,
        ice: 2,
        water: .8,
        iron: 4,
        titanium: 3.5,
        uranium: 2.2,
        robots: 2,
        rhodium: 18.7,
        technetium: 3
    },
    icon: "dx",
    pos: [900, 230],
    type: "ice",
    info: {
        radius: 8230,
        temp: -25,
        atmos: "CO<sub>2</sub>",
        orbit: 5.08
    }
}));
planets.push(new Planet({
    influence: 650,
    name: "Seal of War",
    baseRes: {
        nanotubes: 5,
        ice: 3,
        water: .8,
        iron: 4,
        titanium: 3.5,
        uranium: 2.2,
        robots: 2,
        rhodium: 18.7,
        technetium: 3
    },
    icon: "fx",
    pos: [830, 380],
    type: "lava",
    info: {
        radius: 8230,
        temp: 322,
        atmos: "Sulfur",
        orbit: .45
    }
}));
planets.push(new Planet({
    influence: 650,
    name: "Seal of Death",
    baseRes: {
        sulfur: 2.7
    },
    icon: "dx",
    pos: [720, 240],
    type: "lava",
    info: {
        radius: 1561,
        temp: -58,
        atmos: "Sulfur",
        orbit: .25
    }
}));
planets.push(new Planet({
    influence: 650,
    name: "Solidad",
    baseRes: {
        nanotubes: 5,
        ice: 3,
        biomass: 3,
        water: .8,
        iron: 4,
        titanium: 3.5,
        uranium: 2.2,
        robots: 2,
        rhodium: 18.7,
        technetium: 3
    },
    icon: "x",
    pos: [378, 318],
    type: "lava",
    info: {
        radius: 8230,
        temp: -58,
        atmos: "CO<sub>2</sub>",
        orbit: 7.45
    }
}));
planets.push(new Planet({
    influence: 1,
    name: "Kartarid",
    baseRes: {
        population: -10,
        titanium: .58,
        uranium: 2.02,
        rhodium: .79,
        ice: .26
    },
    icon: "x",
    pos: [8E3, 0],
    type: "Rock Planet"
}));
planets.push(new Planet({
    influence: 1,
    name: "Cerberus",
    baseRes: {
        iron: 3.42,
        steel: 2,
        plastic: .1,
        titanium: 2.17,
        uranium: .8,
        rhodium: 1.8,
        graphite: 3.4,
        silicon: 1.5
    },
    type: "Lava Planet",
    icon: "x",
    pos: [8E3, 880]
}));
planets.push(PlanetBuilder(12, "Child of the Grave", 5.2, 0, "x", [8E3, 0]));
planets.push(PlanetBuilder(0, "Tregemelli", 0, 0, "x", [8E3, 0]));
planets.push(PlanetBuilder(0, "Zurkarap", 0, 0, "x", [8E3, 0]));
planets.push(PlanetBuilder(17, "Garden of Flowers", 0, 0, "x", [430, 0]));
planets.push(new Planet({
    influence: 38,
    name: "Lone Nassaus",
    unlock: "vulcan",
    baseRes: {
        thorium: 1.5,
        rhodium: 1.8,
        graphite: 3.4,
        sulfur: 1,
        titanium: 5
    },
    type: "lava",
    icon: "nassaus",
    pos: [80, 520],
    info: {
        radius: 6771,
        temp: 582,
        atmos: "Sulfur",
        orbit: .1
    }
}));
planets.push(new Planet({
    influence: 5,
    name: "Solidad",
    baseRes: {
        population: .15,
        biomass: 3,
        iron: 3,
        graphite: 2,
        titanium: 3,
        methane: 2,
        oil: 1.5,
        water: .5
    },
    icon: "solidad",
    pos: [578, 33],
    type: "terrestrial",
    info: {
        radius: 5741,
        temp: 38,
        atmos: "Oxygen",
        orbit: .85
    }
}));
planets.push(new Planet({
    influence: 900,
    name: "Seal of Conquest",
    baseRes: {
        coolant: 1.5,
        ice: 5,
        titanium: 1,
        osmium: 2.8,
        uranium: 1.5,
        biomass: .5,
        graphite: 1.6
    },
    icon: "conquest",
    pos: [655, 158],
    type: "ice",
    info: {
        radius: 3220,
        temp: -158,
        atmos: "CO<sub>2</sub>",
        orbit: 3
    }
}));
planets.push(new Planet({
    influence: 1850,
    name: "Seal of Famine",
    baseRes: {
        coolant: 2,
        biomass: .8,
        ice: 2.5,
        titanium: 3.5,
        uranium: 4,
        iron: 8,
        methane: 1.8
    },
    icon: "kartarid",
    pos: [580, 241],
    type: "ice",
    info: {
        radius: 2891,
        temp: -171,
        atmos: "CO<sub>2</sub>",
        orbit: 8
    }
}));
planets.push(new Planet({
    influence: 2498,
    name: "Seal of War",
    baseRes: {
        armor: 3,
        engine: 3,
        thorium: 4,
        sulfur: 2.5,
        graphite: 1.7,
        titanium: 5,
        rhodium: .5
    },
    icon: "cerberus",
    pos: [468, 261],
    type: "lava",
    info: {
        radius: 4230,
        temp: 322,
        atmos: "Sulfur",
        orbit: .45
    }
}));
planets.push(new Planet({
    influence: 3132,
    name: "Seal of Death",
    baseRes: {
        sulfur: 2.7,
        thorium: 2,
        rhodium: 3,
        graphite: 3.5,
        titanium: 1.2,
        engine: 5
    },
    icon: "death",
    pos: [633, 341],
    type: "lava",
    info: {
        radius: 5661,
        temp: 591,
        atmos: "Sulfur",
        orbit: .25
    }
}));
planets.push(new Planet({
    influence: 3844,
    name: "Berenil",
    baseRes: {
        sand: 1.5,
        titanium: .5,
        oil: 1,
        water: 3,
        graphite: 3,
        rhodium: 11
    },
    icon: "yanyin",
    pos: [864, 264],
    type: "ocean",
    info: {
        radius: 12242,
        temp: 31,
        atmos: "Hydrogen",
        orbit: .8
    }
}));
planets.push(new Planet({
    influence: 5222,
    name: "Siris",
    baseRes: {
        sand: 2.5,
        uranium: .8,
        oil: 1.2,
        water: 1.5,
        graphite: 2.8,
        osmium: 7.1
    },
    icon: "siris",
    pos: [963, 139],
    type: "ocean",
    info: {
        radius: 15180,
        temp: 6,
        atmos: "Hydrogen",
        orbit: 1.7
    }
}));
planets.push(new Planet({
    influence: 6920,
    name: "Xilea",
    baseRes: {
        caesium: .5,
        sand: .5,
        uranium: 3.1,
        titanium: 2.2,
        water: 5,
        graphite: 1
    },
    icon: "xilea",
    pos: [1133, 113],
    type: "ocean",
    info: {
        radius: 15705,
        temp: 19,
        atmos: "Hydrogen",
        orbit: 1.12
    }
}));
planets.push(new Planet({
    influence: 15520,
    name: "Twin Asun",
    baseRes: {
        sand: 1,
        iron: 2,
        uranium: 5.7,
        titanium: 2,
        water: 12
    },
    icon: "asun",
    pos: [1070, 293],
    type: "ocean",
    info: {
        radius: 13010,
        temp: 3,
        atmos: "Hydrogen",
        orbit: 2.04
    }
}));
planets.push(new Planet({
    influence: 4711,
    name: "Dagama",
    baseRes: {
        population: .25,
        biomass: 2.5,
        sand: 1.5,
        titanium: .5,
        oil: 1,
        water: 3,
        graphite: 3
    },
    icon: "swamp",
    pos: [670, 474],
    type: "terrestrial",
    info: {
        radius: 5390,
        temp: 21,
        atmos: "Oxygen",
        orbit: .72
    },
    unlock: "space_mining"
}));
planets.push(new Planet({
    influence: 5898,
    name: "Columbus",
    baseRes: {
        thorium: 1.8,
        iron: 2,
        graphite: 5.1,
        uranium: 15.6,
        osmium: 2.7
    },
    icon: "columbus",
    pos: [541, 552],
    type: "radioactive",
    info: {
        radius: 8004,
        temp: -26,
        atmos: "CO<sub>2</sub>",
        orbit: 1.5
    }
}));
planets.push(new Planet({
    influence: 8004,
    name: "Magellan",
    baseRes: {
        caesium: 1,
        titanium: 2.5,
        graphite: 3,
        sulfur: 5
    },
    icon: "magellan",
    pos: [643, 626],
    type: "acid",
    info: {
        radius: 4532,
        temp: 370,
        atmos: "Sulfuric Acid",
        orbit: .6
    }
}));
planets.push(new Planet({
    influence: 11422,
    name: "Gerlache",
    baseRes: {
        thorium: 3,
        sand: 1.5,
        titanium: .5,
        oil: 1,
        water: 3,
        graphite: 3
    },
    icon: "gerlache",
    pos: [809, 592],
    type: "ice",
    info: {
        radius: 2801,
        temp: -71,
        atmos: "Oxygen",
        orbit: 2.9
    }
}));
planets.push(new Planet({
    influence: 21870,
    name: "Gagarin",
    baseRes: {
        sand: 1.5,
        titanium: .5,
        oil: 1,
        water: 1,
        graphite: 3
    },
    icon: "gagarin",
    pos: [834, 713],
    type: "terrestrial",
    info: {
        radius: 7268,
        temp: 15,
        atmos: "Oxygen",
        orbit: .5
    }
}));
planets.push(new Planet({
    influence: 580,
    name: "Alfari",
    baseRes: {
        ammunition: 2,
        sand: 5,
        titanium: 15.5,
        silicon: 3,
        oil: 3,
        water: 1,
        graphite: 8
    },
    icon: "alfari",
    pos: [320, 84],
    type: "desert",
    info: {
        radius: 8256,
        temp: 68,
        atmos: "CO<sub>2</sub>",
        orbit: .7
    },
    unlock: "karan_artofwar"
}));
planets.push(new Planet({
    influence: 808,
    name: "Xenovirgo",
    baseRes: {
        "u-ammunition": 2,
        thorium: 1.8,
        titanium: 8,
        graphite: 11,
        uranium: 7,
        rhodium: 4.8,
        osmium: 3.5
    },
    icon: "xeno",
    pos: [200, 51],
    type: "radioactive",
    info: {
        radius: 4009,
        temp: -101,
        atmos: "CO<sub>2</sub>",
        orbit: 11.81
    },
    unlock: "karan_nuclear"
}));
planets.push(new Planet({
    influence: 32740,
    name: "Caligo Flavus",
    baseRes: {
        caesium: 1.5,
        sulfur: 6.2,
        titanium: 3,
        graphite: 2,
        rhodium: 7
    },
    icon: "caligo",
    pos: [80, 96],
    type: "acid",
    info: {
        radius: 6208,
        temp: 322,
        atmos: "Sulfuric Acid",
        orbit: .52
    }
}));
planets.push(new Planet({
    influence: 1E5,
    name: "Halea",
    baseRes: {
        titanium: 18,
        graphite: 15,
        sand: 15,
        water: 18
    },
    icon: "halea",
    pos: [980, 401],
    type: "ocean",
    info: {
        radius: 9889,
        temp: 22,
        atmos: "Hydrogen",
        orbit: .8
    }
}));
planets.push(new Planet({
    influence: 18E3,
    name: "Persephone",
    baseRes: {
        population: .2,
        biomass: 5,
        titanium: 18,
        graphite: 15,
        sand: 15,
        water: 18
    },
    icon: "persephone",
    pos: [338, 336],
    type: "terrestrial",
    info: {
        radius: 5366,
        temp: 25,
        atmos: "Oxygen",
        orbit: 1.1
    }
}));
planets.push(new Planet({
    influence: 44E3,
    name: "Hades",
    baseRes: {
        population: .05,
        titanium: 18,
        graphite: 15,
        sand: 15,
        water: 18
    },
    icon: "hades",
    pos: [180, 290],
    type: "desert",
    info: {
        radius: 2251,
        temp: 41,
        atmos: "Oxygen",
        orbit: .9
    }
}));
planets.push(new Planet({
    influence: 15E4,
    name: "Demeter",
    baseRes: {
        hydrogen: 6,
        methane: 54,
        technetium: 8
    },
    icon: "demeter",
    pos: [80, 350],
    type: "gas giant",
    info: {
        radius: 109044,
        temp: 422,
        atmos: "Helium",
        orbit: .1
    }
}));
planets.push(new Planet({
    influence: 58E3,
    name: "Hermr",
    baseRes: {
        thorium: 2.5,
        sulfur: 3.4,
        titanium: 3,
        engine: 5
    },
    icon: "hermr",
    pos: [300, 400],
    type: "acid",
    info: {
        radius: 2007,
        temp: 282,
        atmos: "CO<sub>2</sub>",
        orbit: 4
    }
}));
planets.push(new Planet({
    influence: 128E3,
    name: "Calipsi Theta",
    baseRes: {
        ammonia: 6.2,
        titanium: 2.5,
        uranium: 1.1,
        coolant: 5
    },
    icon: "calipsi",
    pos: [210, 500],
    type: "ammonia",
    info: {
        radius: 3015,
        temp: -58,
        atmos: "Nitrogen",
        orbit: 5.6
    }
}));
planets.push(new Planet({
    influence: 7E4,
    unlock: "ammonia_chemistry",
    name: "Auriga",
    baseRes: {
        ammonia: 12,
        uranium: 5
    },
    icon: "auriga",
    pos: [320, 440],
    type: "ammonia",
    info: {
        radius: 3847,
        temp: -64,
        atmos: "Nitrogen",
        orbit: 8.5
    }
}));
planets.push(new Planet({
    influence: 234E3,
    name: "Cygnus Rufus",
    baseRes: {
        ammonia: 15.8
    },
    icon: "cygnus",
    pos: [250, 650],
    type: "ammonia",
    info: {
        radius: 4382,
        temp: -72,
        atmos: "Nitrogen",
        orbit: 5.2
    }
}));
planets.push(new Planet({
    influence: 202E3,
    name: "Forax",
    baseRes: {
        graphite: 25,
        titanium: 8,
        thorium: 4.5,
        nanotubes: 15
    },
    icon: "forax",
    pos: [22, 590],
    type: "carbon",
    info: {
        radius: 3766,
        temp: -22,
        atmos: "Nitrogen",
        orbit: 3
    }
}));
planets.push(new Planet({
    influence: 5E5,
    name: "Volor Ashtar",
    baseRes: {
        titanium: 12,
        graphite: 15,
        thorium: 7.1,
        nanotubes: 35
    },
    icon: "volor",
    pos: [230, 820],
    type: "carbon",
    info: {
        radius: 2541,
        temp: -28,
        atmos: "Nitrogen",
        orbit: 6.1
    }
}));
for (i = 0; i < planets.length; i++) planets[i].id = i, planetsName[planets[i].icon] = i, planets[i].population = 0;

function Place(b) {
    this.id = b.id;
    this.name = b.name;
    this.planet = b.planet;
    this.staticDescription = b.description;
    this.bonusDescription = b.bonusDescription;
    this.position = b.position || {
        x: .5,
        y: .5
    };
    this.descriptionCheck = b.descriptionCheck || function () {
        return !0
    };
    this.extraAction = b.action || function () {};
    this.done = !1;
    this.quest = b.quest || "";
    this.description = function () {
        var b = this.staticDescription;
        this.descriptionCheck() && (b += ", " + this.bonusDescription);
        return b
    };
    this.action = function () {
        this.available() && (this.extraAction(),
            this.done = !0)
    };
    this.available = function () {
        var b = quests[questNames[this.quest]];
        return b.available() && !b.done && !this.done
    }
}
var places = [];
places.push(new Place({
    id: "city_market",
    name: "The market of the Citizens",
    quest: "traum_0",
    planet: planetsName.mexager,
    position: {
        x: .5,
        y: .6
    },
    description: "Local merchants are talking about a recent fight between police officials and a foreign man.",
    bonusDescription: "Your investigation team has been questioned by local officials. Your reputation is decreasing. You get <span class='red_text'>-20</span> reputation with <span class='blue_text'>The City</span>",
    action: function () {
        game.reputation[civisName.city] >=
            repLevel.friendly.min && addRep(game.id, civisName.city, -20)
    },
    descriptionCheck: function () {
        if (game.reputation[civisName.city] >= repLevel.friendly.min) return !0
    }
}));
places.push(new Place({
    id: "taiwan_hotel",
    name: "Hotel Tai Wan Hue",
    quest: "traum_0",
    planet: planetsName.mexager,
    position: {
        x: .6,
        y: .3
    },
    description: "The investigation team has found blood trails inside the hall of the hotel. The blood trails belong to Sebastian Jones.",
    bonusDescription: "Your team had been arrested by The City's Police, but had been later released thanks to your influence. You get <span class='red_text'>-50</span> reputation with <span class='blue_text'>The City</span>",
    action: function () {
        game.reputation[civisName.city] >=
            repLevel.friendly.min && addRep(game.id, civisName.city, -50)
    },
    descriptionCheck: function () {
        if (game.reputation[civisName.city] >= repLevel.friendly.min) return !0
    }
}));
places.push(new Place({
    id: "maipei_plant",
    name: "Maipei Energy Plant",
    quest: "traum_0",
    planet: planetsName.mexager,
    position: {
        x: .48,
        y: .28
    },
    description: "The investigation team has found stolen plans of the Traumland Energy Corporation, and an abandoned cargo of 2000 <span class='blue_text'>Coolants</span> which has been sent to <span class='blue_text'>" + planets[game.capital].name + "</span>",
    bonusDescription: "The City's Council has intimated you to leave the planet. You get <span class='red_text'>-100</span> reputation with <span class='blue_text'>The City</span>",
    action: function () {
        game.reputation[civisName.city] >= repLevel.friendly.min && addRep(game.id, civisName.city, -100);
        planets[game.capital].resources[resourcesName.coolant.id] += 2E3
    },
    descriptionCheck: function () {
        if (game.reputation[civisName.city] >= repLevel.friendly.min) return !0
    }
}));
var placesNames = [];
for (q = 0; q < places.length; q++) placesNames[places[q].id] = q, planets[places[q].planet].places.push(places[q]);
var books = [];
books.push(new Book({
    title: "Empress Message",
    pages: ["To all people of Halean Galactic Empire, the Empress herself is writing to you.<br>It is with immense sadness and despair that I announce our failure. Azure Fleet has fallen together with our fellow brothers and sisters, fathers and mothers, husbands and wives. In these extreme circumstances nothing is left to be done. All units must immediately disengage and retreat. Every colony must be immediately abandoned and don't take anything with you. You won't lose anything because we already lost everything. We won't let the enemy cancel us from the galayx thuogh. We will see each other in our ancestor's land, and we will soon become stronger than ever! Further instructions will follow.<br>Together we stand, divided we fall.<br><br>Empress Maira"],
    req: function () {
        return game.searchPlanet(planetsName.posirion) &&
            game.searchPlanet(planetsName.traurig) && game.searchPlanet(planetsName.epsilon) && game.searchPlanet(planetsName.zhura) && game.searchPlanet(planetsName.bhara) && game.searchPlanet(planetsName.caerul)
    }
}));
var routes = [];
routes.push(new Route("promision", "vasilis"));
routes.push(new Route("vasilis", "aequoreas"));
routes.push(new Route("aequoreas", "orpheus"));
routes.push(new Route("orpheus", "santorini"));
routes.push(new Route("orpheus", "mexager"));
routes.push(new Route("orpheus", "uanass"));
routes.push(new Route("posirion", "zelera"));
routes.push(new Route("santorini", "traumland"));
routes.push(new Route("santorini", "lagea"));
routes.push(new Route("lagea", "zelera"));
routes.push(new Route("santorini", "miselquris"));
routes.push(new Route("kurol", "miselquris"));
routes.push(new Route("miselquris", "jabir"));
routes.push(new Route("jabir", "teleras"));
routes.push(new Route("antaris", "jabir"));
routes.push(new Route("zhura", "bhara"));
routes.push(new Route("epsilon", "zhura"));
routes.push(new Route("caerul", "epsilon"));
routes.push(new Route("epsilon", "traurig"));
routes.push(new Route("posirion", "traurig"));
routes.push(new Route("antaris", "tsartasis"));
routes.push(new Route("ares", "kandi"));
routes.push(new Route("kandi", "echoes"));
routes.push(new Route("echoes", "tsartasis"));
routes.push(new Route("echoes", "xora2"));
routes.push(new Route("xora2", "xora"));
routes.push(new Route("tsartasis", "mermorra"));
routes.push(new Route("kitrino", "mermorra"));
routes.push(new Route("santorini", "virgo"));
routes.push(new Route("kurol", "nassaus"));
routes.push(new Route("solidad", "conquest"));
routes.push(new Route("conquest", "kartarid"));
routes.push(new Route("kartarid", "cerberus"));
routes.push(new Route("kartarid", "death"));
routes.push(new Route("death", "yanyin"));
routes.push(new Route("death", "swamp"));
routes.push(new Route("swamp", "columbus"));
routes.push(new Route("columbus", "magellan"));
routes.push(new Route("magellan", "gerlache"));
routes.push(new Route("gerlache", "gagarin"));
routes.push(new Route("yanyin", "siris"));
routes.push(new Route("siris", "xilea"));
routes.push(new Route("xilea", "asun"));
routes.push(new Route("solidad", "alfari"));
routes.push(new Route("xeno", "alfari"));
routes.push(new Route("xeno", "caligo"));
routes.push(new Route("asun", "halea"));
routes.push(new Route("cerberus", "persephone"));
routes.push(new Route("hades", "persephone"));
routes.push(new Route("demeter", "hades"));
routes.push(new Route("persephone", "hermr"));
routes.push(new Route("hermr", "auriga"));
routes.push(new Route("hermr", "calipsi"));
routes.push(new Route("calipsi", "cygnus"));
routes.push(new Route("calipsi", "forax"));
routes.push(new Route("cygnus", "volor"));
for (i = 0; i < routes.length; i++) routes[i].id = i, planets[routes[i].planet1].routes.push(routes[i]), planets[routes[i].planet2].routes.push(routes[i]);
planets[planetsName.promision].setCivis(0);
planets[planetsName.mexager].setCivis(1);
civis[1].capital = planetsName.mexager;
planets[planetsName.traumland].setCivis(2);
civis[2].capital = planetsName.traumland;
planets[planetsName.caerul].setCivis(4);
civis[4].capital = planetsName.caerul;
planets[planetsName.bhara].setCivis(4);
planets[planetsName.zhura].setCivis(4);
planets[planetsName.epsilon].setCivis(4);
planets[planetsName.traurig].setCivis(4);
planets[planetsName.posirion].setCivis(4);
planets[planetsName.miselquris].setCivis(5);
civis[5].capital = planetsName.miselquris;
planets[planetsName.kurol].setCivis(5);
planets[planetsName.jabir].setCivis(5);
planets[planetsName.teleras].setCivis(5);
planets[planetsName.antaris].setCivis(5);
planets[planetsName.zelera].setCivis(6);
civis[6].capital = planetsName.zelera;
planets[planetsName.uanass].setCivis(7);
planets[planetsName.nassaus].setCivis(7);
civis[7].capital = planetsName.uanass;
planets[planetsName.xora2].setCivis(3);
civis[3].capital = planetsName.xora2;
planets[planetsName.xora].setCivis(3);
planets[planetsName.tsartasis].setCivis(3);
planets[planetsName.echoes].setCivis(3);
planets[planetsName.mermorra].setCivis(3);
planets[planetsName.kitrino].setCivis(3);
planets[planetsName.kandi].setCivis(3);
planets[planetsName.ares].setCivis(3);
planets[planetsName.santorini].setCivis(8);
planets[planetsName.virgo].setCivis(8);
civis[8].capital = planetsName.virgo;
planets[planetsName.lagea].setCivis(9);
civis[9].capital = planetsName.lagea;
planets[planetsName.conquest].setCivis(10);
planets[planetsName.cerberus].setCivis(10);
planets[planetsName.death].setCivis(10);
planets[planetsName.kartarid].setCivis(10);
planets[planetsName.yanyin].setCivis(11);
planets[planetsName.siris].setCivis(11);
planets[planetsName.xilea].setCivis(11);
planets[planetsName.asun].setCivis(11);
planets[planetsName.swamp].setCivis(12);
planets[planetsName.columbus].setCivis(12);
planets[planetsName.magellan].setCivis(12);
planets[planetsName.gagarin].setCivis(12);
planets[planetsName.gerlache].setCivis(12);
planets[planetsName.alfari].setCivis(13);
planets[planetsName.xeno].setCivis(13);
planets[planetsName.caligo].setCivis(13);
planets[planetsName.halea].setCivis(14);
planets[planetsName.persephone].setCivis(15);
planets[planetsName.hades].setCivis(15);
planets[planetsName.demeter].setCivis(15);
planets[planetsName.hermr].setCivis(16);
planets[planetsName.auriga].setCivis(16);
planets[planetsName.calipsi].setCivis(16);
planets[planetsName.forax].setCivis(16);
planets[planetsName.cygnus].setCivis(16);
planets[planetsName.volor].setCivis(16);
planets[i].population = 1E3;
for (i = 1; i < planets.length; i++) planets[i].civis && (planets[i].population = planets[i].sustainable());

function Region(b) {
    this.name = b;
    this.planets = []
}
var regions = [];
r = new Region("Pirates");
r.planets = [planetsName.traumland, planetsName.lagea, planetsName.posirion, planetsName.santorini];
regions.push();
r = new Region("Metallokopta territories");
r.planets = [planetsName.echoes, planetsName.ares, planetsName.kandi, planetsName.antaris, planetsName.teleras, planetsName.jabir, planetsName.kitrino, planetsName.xora, planetsName.xora2, planetsName.tsartasis, planetsName.mermorra];
regions.push();
r = new Region("Lost Planet of Juinika");
r.planets = [planetsName.echoes, planetsName.tsartasis, planetsName.xora2];
regions.push();
r = new Region("Lost Planet of Mars");
r.planets = [planetsName.bhara, planetsName.zhura, planetsName.ares];
regions.push();
for (i = 0; i < civis.length; i++) {
    var buildings = [];
    buildings.push(new Building({
        name: "mine",
        displayName: "Mining Plant",
        cost: {
            iron: 10,
            steel: 9.75E-4,
            titanium: 2.1E-12
        },
        prod: {
            iron: 2
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.5
        },
        type: "mining"
    }));
    buildings.push(new Building({
        name: "methaneext",
        displayName: "Methane Extractor",
        cost: {
            iron: 100,
            steel: .1,
            titanium: 3E-5
        },
        prod: {
            methane: 1
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.5
        },
        type: "mining"
    }));
    buildings.push(new Building({
        name: "graphext",
        displayName: "Graphite Extractor",
        cost: {
            iron: 500,
            steel: .5,
            titanium: 4E-4
        },
        prod: {
            graphite: 1
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.5
        },
        type: "mining",
        environment: "desert ice terrestrial metallic radioactive acid".split(" ")
    }));
    buildings.push(new Building({
        name: "pumpjack",
        displayName: "Oil Pump",
        cost: {
            steel: 1E3,
            titanium: .9
        },
        prod: {
            pollution: 1,
            oil: 1
        },
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "mining",
        req: {
            chemical: 1
        }
    }));
    buildings.push(new Building({
        name: "collector",
        displayName: "Metal Collector",
        cost: {
            steel: 2E3,
            titanium: .9
        },
        prod: {
            titanium: 10,
            uranium: 1
        },
        energy: -50,
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "mining",
        req: {
            mineralogy: 3
        },
        environment: "desert ice terrestrial metallic radioactive acid".split(" ")
    }));
    buildings.push(new Building({
        name: "farm",
        displayName: "Crop Farm",
        cost: {
            steel: 5E3,
            titanium: 2.1E-12
        },
        prod: {
            biomass: 1
        },
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "mining",
        environment: ["terrestrial"],
        req: {
            nononono: 1
        }
    }));
    buildings.push(new Building({
        name: "pump",
        displayName: "Water Pump",
        cost: {
            steel: 1E4,
            titanium: 1E3
        },
        energy: -10,
        prod: {
            water: 1
        },
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "mining",
        req: {
            hydro: 1
        }
    }));
    buildings.push(new Building({
        name: "quarry",
        req: {
            mineralogy: 4
        },
        displayName: "Sand Quarry",
        cost: {
            steel: 5E3,
            titanium: 1E3
        },
        prod: {
            sand: 1
        },
        energy: -80,
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "mining"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "icedrill",
        displayName: "Ice Drill",
        cost: {
            iron: 1E4,
            steel: 2E3,
            titanium: 1E3
        },
        prod: {
            ice: 1
        },
        mult: {
            iron: 1.1,
            steel: 1.2,
            titanium: 1.3
        },
        type: "mining",
        environment: ["ice"],
        req: {
            ice: 1
        }
    }));
    buildings.push(new Building({
        name: "fish",
        displayName: "Arctic Fishing Outpost",
        cost: {
            titanium: 2E4,
            plastic: 1E4
        },
        prod: {
            biomass: 1
        },
        mult: {
            titanium: 1.5,
            plastic: 1.8
        },
        type: "mining",
        environment: ["ice"],
        req: {
            environment: 1
        }
    }));
    buildings.push(new Building({
        name: "hunting",
        displayName: "Hunting Spot",
        cost: {
            iron: 1E3,
            steel: 10
        },
        prod: {
            biomass: 1
        },
        mult: {
            iron: 1.2,
            steel: 1.35
        },
        type: "mining",
        environment: ["terrestrial"],
        req: {
            environment: 1
        }
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "pumpplt",
        displayName: "Pumping Platform",
        cost: {
            steel: 5E3,
            titanium: 1E3
        },
        prod: {
            water: 5
        },
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "mining",
        environment: ["ocean"],
        req: {
            hydro: 0
        }
    }));
    buildings.push(new Building({
        name: "submetal",
        displayName: "Submerged Metal Mine",
        cost: {
            iron: 5E3,
            steel: 1E3,
            titanium: 100
        },
        prod: {
            iron: 5,
            titanium: 3,
            uranium: 1
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.4
        },
        type: "mining",
        environment: ["ocean", "ammonia"],
        req: {
            hydro: 1
        }
    }));
    buildings.push(new Building({
        name: "subsand",
        displayName: "Submerged Sand Mine",
        cost: {
            iron: 5E3,
            steel: 1E3,
            titanium: 100
        },
        prod: {
            graphite: 2,
            sand: 1
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.4
        },
        type: "mining",
        environment: ["ocean", "ammonia"],
        req: {
            hydro: 1
        }
    }));
    buildings.push(new Building({
        name: "rhodiumext",
        displayName: "Rhodium Extractor",
        cost: {
            silicon: 25E4,
            sand: 100 * mi,
            fuel: 100 * mi
        },
        prod: {
            rhodium: 2,
            titanium: 20
        },
        mult: {
            silicon: 1.3,
            sand: 1.4,
            fuel: 1.5
        },
        energy: -800,
        type: "mining",
        environment: "desert lava metallic acid radioactive ice".split(" "),
        req: {
            rhodium: 1
        }
    }));
    buildings.push(new Building({
        name: "thoriumext",
        req: {
            karan_nuclear: 1
        },
        displayName: "Thorium-Caesium Extractor",
        cost: {
            titanium: 50 * mi,
            nanotubes: 5E5,
            engine: 3E4
        },
        mult: {
            titanium: 1.2,
            nanotubes: 1.3,
            engine: 1.2
        },
        prod: {
            thorium: 8,
            caesium: 1
        },
        energy: -300,
        type: "mining",
        environment: allEnvExt
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "floatharv",
        displayName: "Methane Harvester",
        cost: {
            iron: 1E4,
            steel: 100,
            plastic: 10,
            titanium: 2.1E-12
        },
        prod: {
            methane: 1
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.4
        },
        type: "mining",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "condenser",
        displayName: "Hydrogen Condenser",
        cost: {
            steel: 25E3,
            titanium: 1E4,
            plastic: 500
        },
        prod: {
            hydrogen: 10
        },
        mult: {
            steel: 1.2,
            titanium: 1.3,
            plastic: 1.4
        },
        type: "mining",
        req: {
            nuclear: 1
        },
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "sand",
        displayName: "Sand Mine",
        cost: {
            iron: 35E4
        },
        prod: {
            sand: 1
        },
        mult: {
            iron: 1.2
        },
        type: "mining",
        environment: ["desert"]
    }));
    buildings.push(new Building({
        name: "ammonia_ext",
        req: {
            ammonia_chemistry: 1
        },
        prod: {
            ammonia: 1
        },
        displayName: "Ammonia Extractor",
        cost: {
            nanotubes: 1 * mi,
            engine: 1E3
        },
        mult: {
            nanotubes: 1.25,
            engine: 1.35
        },
        type: "mining",
        environment: ["ammonia"]
    }));
    buildings.push(new Building({
        name: "ammonia_electro",
        req: {
            ammonia_chemistry: 1
        },
        displayName: "Ammonia Electrolyzer",
        cost: {
            nanotubes: 1 * mi,
            engine: 5E3
        },
        mult: {
            nanotubes: 1.25,
            engine: 1.35
        },
        prod: {
            ammonia: -10,
            hydrogen: 30
        },
        energy: -100,
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "converter",
        displayName: "Methane Processer",
        cost: {
            iron: 100,
            steel: .25,
            titanium: 2E-4
        },
        mult: {
            iron: 1.1,
            steel: 1.2,
            titanium: 1.3
        },
        prod: {
            pollution: 2,
            methane: -2,
            fuel: 1
        },
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "foundry",
        displayName: "Foundry",
        cost: {
            iron: 1E3,
            steel: .48,
            titanium: .01
        },
        prod: {
            pollution: 2,
            steel: 2,
            graphite: -1,
            iron: -2,
            fuel: -2
        },
        mult: {
            iron: 1.1,
            steel: 1.2,
            titanium: 1.3
        },
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "ref",
        displayName: "Oil Refinery",
        cost: {
            steel: 5E3,
            titanium: 100
        },
        prod: {
            pollution: 50,
            oil: -1,
            fuel: 5
        },
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "prod",
        type2: "prod",
        req: {
            chemical: 2
        }
    }));
    buildings.push(new Building({
        name: "plastic",
        displayName: "Plastic Factory",
        cost: {
            steel: 1E4,
            titanium: 5E3
        },
        prod: {
            pollution: 100,
            oil: -3,
            plastic: 1
        },
        energy: -100,
        mult: {
            steel: 1.25,
            titanium: 1.35
        },
        type: "prod",
        type2: "prod",
        req: {
            material: 8
        }
    }));
    buildings.push(new Building({
        name: "sandsmelt",
        displayName: "Sand Smelter",
        cost: {
            steel: 2E4,
            titanium: 1E4,
            plastic: 500
        },
        prod: {
            sand: -1,
            silicon: 1
        },
        energy: -50,
        mult: {
            steel: 1.1,
            titanium: 1.2,
            plastic: 1.3
        },
        type: "prod",
        type2: "prod",
        req: {
            electronics: 1
        }
    }));
    buildings.push(new Building({
        name: "electronic",
        displayName: "Electronic Facility",
        cost: {
            steel: 1E5,
            titanium: 5E4,
            plastic: 2E3
        },
        prod: {
            pollution: 10,
            plastic: -2,
            silicon: -10,
            circuit: 1
        },
        energy: -200,
        mult: {
            steel: 1.2,
            titanium: 1.3,
            plastic: 1.4
        },
        type: "prod",
        type2: "prod",
        req: {
            electronics: 1
        }
    }));
    buildings.push(new Building({
        name: "amno",
        displayName: "Ammunition Factory",
        cost: {
            titanium: 1E5,
            plastic: 2E4
        },
        prod: {
            steel: -100,
            fuel: -5,
            plastic: -3,
            ammunition: 10
        },
        mult: {
            titanium: 1.25,
            plastic: 1.35
        },
        energy: -200,
        type: "prod",
        type2: "prod",
        req: {
            military: 1
        },
        description: "Ammunition can be loaded into war fleets to receive an additional power bonus. All ammunitions will be depleted after the battle."
    }));
    buildings.push(new Building({
        name: "freezer",
        displayName: "Water Freezer",
        cost: {
            iron: 28E3,
            steel: 1E4,
            titanium: 500
        },
        prod: {
            ice: 3,
            water: -2
        },
        energy: -30,
        mult: {
            iron: 1.15,
            steel: 1.27,
            titanium: 1.35
        },
        type: "prod",
        type2: "prod",
        req: {
            ice: 1
        }
    }));
    buildings.push(new Building({
        name: "nanofact",
        req: {
            material: 15
        },
        displayName: "Nanotubes Factory",
        cost: {
            titanium: 25E4,
            plastic: 5E4,
            circuit: 15E3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        energy: -500,
        prod: {
            graphite: -200,
            plastic: -10,
            hydrogen: -100,
            nanotubes: 5
        },
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "coolfact",
        req: {
            ice: 10
        },
        displayName: "Coolant Factory",
        cost: {
            plastic: 3E5,
            circuit: 1E5
        },
        mult: {
            plastic: 1.25,
            circuit: 1.35
        },
        prod: {
            coolant: 8,
            ice: -2E3,
            methane: -100
        },
        energy: -500,
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "robotfact",
        req: {
            artificial_intelligence: 1
        },
        displayName: "Robots Factory",
        cost: {
            plastic: 5E5,
            circuit: 25E4,
            nanotubes: 5E4
        },
        mult: {
            plastic: 1.2,
            circuit: 1.3,
            nanotubes: 1.4
        },
        prod: {
            robots: 1,
            coolant: -8,
            circuit: -50,
            nanotubes: -28,
            steel: -800,
            "full battery": -100
        },
        energy: -500,
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "armorfact",
        req: {
            military: 12
        },
        displayName: "Armor Factory",
        cost: {
            circuit: 5E5,
            nanotubes: 1E5
        },
        energy: -2E3,
        mult: {
            circuit: 1.25,
            nanotubes: 1.35
        },
        prod: {
            steel: -1E3,
            titanium: -500,
            plastic: -200,
            armor: 3
        },
        type: "prod",
        type2: "prod",
        environment: "desert ice terrestrial metallic lava acid".split(" "),
        description: "Armor can be loaded into war fleets to receive an additive armor bonus. Half of the armor storage will depleted after the battle."
    }));
    buildings.push(new Building({
        name: "enginefact",
        req: {
            military: 16
        },
        displayName: "Engine Factory",
        cost: {
            circuit: 8E5,
            nanotubes: 2E5,
            robots: 1E3
        },
        energy: -2500,
        mult: {
            circuit: 1.2,
            nanotubes: 1.3,
            robots: 1.4
        },
        prod: {
            oil: -500,
            coolant: -100,
            circuit: -100,
            steel: -1E3,
            titanium: -500,
            plastic: -200,
            engine: 2
        },
        type: "prod",
        type2: "prod",
        environment: "desert ice terrestrial metallic lava acid".split(" "),
        description: "Engines can be loaded into fleets to receive a speed bonus. Engines won't be depleted during a battle."
    }));
    buildings.push(new Building({
        name: "icesmelter",
        req: {
            ice: 1
        },
        displayName: "Ice Melter",
        cost: {
            iron: 28E3,
            steel: 1E4,
            titanium: 500
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.4
        },
        type: "prod",
        type2: "prod",
        prod: {
            fuel: -1,
            ice: -3,
            water: 2
        },
        environment: allEnvAcid
    }));
    buildings.push(new Building({
        name: "battery_factory",
        req: {
            electronics: 8
        },
        displayName: "Battery Factory",
        cost: {
            titanium: 15E4,
            plastic: 35E3,
            circuit: 2E3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        type: "prod",
        prod: {
            "empty battery": 1E3,
            hydrogen: -1E3,
            steel: -35E4
        },
        energy: -100,
        type2: "prod",
        environment: allEnv,
        description: "Batteries can be used to build other resources or to exchange power between planets."
    }));
    buildings.push(new Building({
        name: "biofuel",
        req: {
            environment: 1
        },
        displayName: "Biofuel Refinery",
        cost: {
            titanium: 1E5,
            plastic: 5E4,
            circuit: 15E3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        prod: {
            oil: 1,
            fuel: 1,
            water: -2,
            biomass: -3
        },
        type: "prod",
        type2: "prod",
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "bioplastic",
        req: {
            environment: 1
        },
        displayName: "Bioplastic Synthesizer",
        cost: {
            titanium: 1E5,
            plastic: 5E4,
            circuit: 15E3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        prod: {
            biomass: -3,
            water: -2,
            plastic: 1
        },
        energy: -80,
        type: "prod",
        type2: "prod",
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "electrolyzer",
        req: {
            hydro: 1
        },
        displayName: "Electrolyzer",
        cost: {
            titanium: 25E3,
            plastic: 1E3,
            circuit: 100
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        prod: {
            water: -1,
            hydrogen: 2
        },
        energy: -50,
        type: "prod",
        type2: "prod",
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "ufact",
        req: {
            military: 8
        },
        displayName: "Uranium Shell Assembler",
        cost: {
            circuit: 3E4,
            plastic: 5E4
        },
        energy: -300,
        mult: {
            circuit: 1.35,
            plastic: 1.25
        },
        type2: "prod",
        type: "prod",
        prod: {
            ammunition: -15,
            uranium: -8,
            "u-ammunition": 5
        },
        environment: allEnvExt,
        description: "U-Ammunition can be loaded into war fleets to receive a power bonus. All ammunitions will be depleted during the battle."
    }));
    buildings.push(new Building({
        name: "algaefarm",
        displayName: "Algae Oil Farm",
        cost: {
            iron: 28E3,
            steel: 1E4,
            titanium: 500
        },
        prod: {
            water: -7,
            oil: 3
        },
        energy: -10,
        mult: {
            iron: 1.15,
            steel: 1.27,
            titanium: 1.35
        },
        type: "prod",
        type2: "prod",
        environment: ["ocean"],
        req: {
            hydro: 0
        }
    }));
    buildings.push(new Building({
        name: "marineref",
        displayName: "Submerged Oil Refinery",
        cost: {
            steel: 15E3,
            titanium: 1E3
        },
        prod: {
            oil: -3,
            fuel: 10
        },
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.4
        },
        type: "prod",
        type2: "prod",
        environment: ["ocean", "ammonia"],
        req: {
            hydro: 0
        }
    }));
    buildings.push(new Building({
        name: "nanomarine",
        req: {
            material: 15
        },
        displayName: "Nanotubes Dome",
        cost: {
            titanium: 25E4,
            plastic: 5E4,
            circuit: 15E3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        energy: -500,
        prod: {
            graphite: -170,
            water: -15,
            plastic: -8,
            hydrogen: -80,
            nanotubes: 5
        },
        type: "prod",
        type2: "prod",
        environment: ["ocean", "ammonia"]
    }));
    buildings.push(new Building({
        name: "tfact",
        req: {
            artofwar: 1
        },
        displayName: "T-Ammunition Assembler",
        cost: {
            technetium: 1E5,
            graphite: 2E5
        },
        mult: {
            technetium: 1.35,
            graphite: 1.25
        },
        type: "prod",
        energy: -750,
        type2: "prod",
        environment: allEnv,
        prod: {
            "u-ammunition": -3,
            technetium: -50,
            steel: -1E5,
            "t-ammunition": 1
        },
        description: "T-Ammunition can be loaded into war fleets to receive an additional power bonus. All ammunitions will be depleted after the battle."
    }));
    buildings.push(new Building({
        name: "particle",
        req: {
            quantum: 1
        },
        displayName: "Particle Accelerator",
        cost: {
            steel: 100 *
                mi,
            technetium: 1 * mi
        },
        mult: {
            steel: 1.8,
            technetium: 1.25
        },
        energy: -1E3,
        prod: {
            antimatter: 1,
            hydrogen: -1E3
        },
        type: "prod",
        type2: "prod",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "rhodiumsand",
        req: {
            rhodium: 1
        },
        displayName: "Rhodium Sand Smelter",
        cost: {
            silicon: 25E4,
            sand: 100 * mi,
            fuel: 100 * mi
        },
        prod: {
            rhodium: -5,
            sand: -150,
            silicon: 100
        },
        mult: {
            silicon: 1.3,
            sand: 1.4,
            fuel: 1.5
        },
        energy: -200,
        type: "prod",
        type2: "prod",
        environment: ["lava", "acid", "desert", "metallic"]
    }));
    buildings.push(new Building({
        name: "floatconv",
        displayName: "Floating Fuel Converter",
        cost: {
            steel: 1E4,
            titanium: 8E3,
            plastic: 5E3
        },
        prod: {
            methane: -5,
            fuel: 3
        },
        mult: {
            steel: 1.2,
            titanium: 1.3,
            plastic: 1.4
        },
        type: "prod",
        type2: "prod",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "floathouse",
        displayName: "Floating Greenhouse",
        cost: {
            steel: 1E4,
            titanium: 8E3,
            plastic: 5E3
        },
        prod: {
            water: -10,
            biomass: 10
        },
        energy: -100,
        mult: {
            steel: 1.2,
            titanium: 1.3,
            plastic: 1.4
        },
        type: "prod",
        type2: "prod",
        environment: ["gas giant"],
        req: {
            environment: 1
        }
    }));
    buildings.push(new Building({
        name: "polymer",
        req: {
            material: 8
        },
        displayName: "Polymerizer",
        cost: {
            titanium: 2E4,
            plastic: 1E3
        },
        energy: -150,
        prod: {
            methane: -80,
            water: -5,
            plastic: 2
        },
        mult: {
            titanium: 1.25,
            plastic: 1.35
        },
        type: "prod",
        type2: "prod",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "osmiumext",
        req: {
            osmium: 1
        },
        displayName: "Osmium Extractor",
        cost: {
            silicon: 5E5,
            rhodium: 3500
        },
        prod: {
            osmium: 1
        },
        mult: {
            silicon: 1.3,
            rhodium: 1.5
        },
        energy: -1200,
        type: "mining",
        environment: ["ice", "metallic", "radioactive"]
    }));
    buildings.push(new Building({
        name: "mkclone",
        req: {
            osmium: 1
        },
        displayName: "Metallokopta Clonator",
        cost: {
            silicon: 25E5,
            rhodium: 15E3
        },
        prod: {
            osmium: -5,
            robots: -5,
            sulfur: -20,
            silicon: -85,
            "mK Embryo": 1
        },
        mult: {
            silicon: 1.3,
            rhodium: 1.5
        },
        energy: -2E3,
        type: "prod",
        type2: "prod",
        environment: ["ice", "desert", "metallic", "radioactive"]
    }));
    buildings.push(new Building({
        name: "ammonia_refrigerator",
        req: {
            ammonia_chemistry: 1
        },
        displayName: "Ammonia Refrigerator",
        cost: {
            nanotubes: 10 * mi,
            engine: 1 * mi
        },
        mult: {
            nanotubes: 1.25,
            engine: 1.35
        },
        prod: {
            coolant: 8,
            ammonia: -10,
            methane: -200
        },
        energy: -500,
        type: "prod",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "generator",
        displayName: "Small Generator",
        cost: {
            iron: 2E3,
            steel: 100,
            titanium: .17
        },
        prod: {
            pollution: 10,
            fuel: -3
        },
        energy: 20,
        mult: {
            iron: 1.15,
            steel: 1.27,
            titanium: 1.35
        },
        type: "energy",
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "thermal",
        displayName: "Thermal Plant",
        cost: {
            iron: 5E3,
            steel: 1E3,
            titanium: .17
        },
        prod: {
            pollution: 30,
            fuel: -10
        },
        energy: 100,
        mult: {
            iron: 2.5,
            steel: 2.7,
            titanium: 1.9
        },
        type: "energy",
        type2: "prod",
        req: {
            chemical: 1
        }
    }));
    buildings.push(new Building({
        name: "solar",
        displayName: "Solar Central",
        cost: {
            steel: 1E4,
            titanium: 1E4,
            silicon: 1E3
        },
        mult: {
            steel: 1.1,
            titanium: 1.1,
            silicon: 1.3
        },
        energy: 50,
        type: "energy",
        type2: "solar",
        req: {
            electronics: 1
        },
        environment: allEnvAcid
    }));
    buildings.push(new Building({
        name: "nuclear",
        displayName: "Nuclear Powerplant",
        cost: {
            titanium: 1E5,
            plastic: 2E4,
            graphite: 1E6
        },
        prod: {
            pollution: 100,
            uranium: -10,
            graphite: -3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            graphite: 1.4
        },
        energy: 500,
        type: "energy",
        type2: "prod",
        req: {
            nuclear: 1
        },
        environment: "desert terrestrial ice metallic lava acid".split(" ")
    }));
    buildings.push(new Building({
        name: "fusion",
        displayName: "Fusion Reactor",
        cost: {
            titanium: 25E4,
            plastic: 1E5,
            circuit: 1E4
        },
        prod: {
            hydrogen: -150
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        energy: 1100,
        type: "energy",
        type2: "prod",
        req: {
            nuclear: 5
        }
    }));
    buildings.push(new Building({
        name: "battery_plant",
        req: {
            electronics: 8
        },
        displayName: "Battery Power Plant",
        prod: {
            "full battery": -1E4,
            "empty battery": 9500
        },
        cost: {
            titanium: 2E5,
            plastic: 5E4,
            circuit: 5E3
        },
        energy: 240,
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            circuit: 1.4
        },
        type: "energy",
        type2: "prod",
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "collider",
        req: {
            quantum: 1
        },
        displayName: "Antimatter Collider",
        cost: {
            steel: 100 * mi,
            technetium: 1 * mi
        },
        mult: {
            steel: 1.8,
            technetium: 1.25
        },
        energy: 8E3,
        prod: {
            antimatter: -1,
            hydrogen: -1E3
        },
        type: "energy",
        type2: "prod",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "nuclear_radio",
        displayName: "Nuclear Powerplant",
        cost: {
            titanium: 1E5,
            plastic: 2E4,
            graphite: 1E6
        },
        prod: {
            pollution: 100,
            uranium: -10,
            graphite: -3
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            graphite: 1.4
        },
        energy: 2E3,
        type: "energy",
        type2: "prod",
        req: {
            nuclear: 1
        },
        environment: ["radioactive"]
    }));
    buildings.push(new Building({
        name: "suboilgen",
        displayName: "Hydrothermal Plant",
        cost: {
            steel: 1E4,
            titanium: 2E3
        },
        prod: {
            water: -2,
            fuel: -10
        },
        energy: 100,
        mult: {
            iron: 1.2,
            steel: 1.35,
            titanium: 1.5
        },
        type: "energy",
        type2: "prod",
        environment: ["ocean"],
        req: {
            hydro: 0
        }
    }));
    buildings.push(new Building({
        name: "dam",
        displayName: "Hydroelectric Plant",
        cost: {
            steel: 15E3,
            titanium: 1E4,
            plastic: 1500
        },
        prod: {
            water: -10
        },
        mult: {
            steel: 1.1,
            titanium: 1.2,
            plastic: 1.3
        },
        energy: 200,
        type: "energy",
        type2: "prod",
        environment: ["ocean"],
        req: {
            hydro: 0
        }
    }));
    buildings.push(new Building({
        name: "pressurized",
        displayName: "Pressurized Water Reactor",
        cost: {
            titanium: 2E5,
            plastic: 1E5,
            graphite: 5E5
        },
        prod: {
            pollution: 200,
            uranium: -5,
            water: -20
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            graphite: 1.4
        },
        energy: 500,
        type: "energy",
        type2: "prod",
        environment: ["ocean"],
        req: {
            nuclear: 3
        }
    }));
    buildings.push(new Building({
        name: "thorium_reactor",
        displayName: "Thorium Reactor",
        cost: {
            titanium: 80 * mi,
            nanotubes: 5 * mi,
            engine: 8E4
        },
        prod: {
            thorium: -5
        },
        mult: {
            titanium: 1.2,
            nanotubes: 1.3,
            engine: 1.2
        },
        energy: 2500,
        type: "energy",
        type2: "prod",
        req: {
            karan_nuclear: 1
        },
        environment: "desert terrestrial ice metallic lava acid".split(" ")
    }));
    buildings.push(new Building({
        name: "thorium_reactor2",
        displayName: "Thorium Reactor",
        cost: {
            titanium: 80 * mi,
            nanotubes: 5 * mi,
            engine: 8E4
        },
        prod: {
            thorium: -5
        },
        mult: {
            titanium: 1.2,
            nanotubes: 1.3,
            engine: 1.2
        },
        energy: 5E3,
        type: "energy",
        type2: "prod",
        req: {
            karan_nuclear: 1
        },
        environment: ["radioactive", "ocean"]
    }));
    buildings.push(new Building({
        name: "floatgenerator",
        displayName: "Floating Generator",
        cost: {
            iron: 2E3,
            steel: 100,
            titanium: .17
        },
        prod: {
            pollution: 10,
            fuel: -3
        },
        energy: 20,
        mult: {
            iron: 1.2,
            steel: 1.3,
            titanium: 1.4
        },
        type: "energy",
        type2: "prod",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "floatreactor",
        displayName: "Floating Reactor",
        cost: {
            plastic: 2E5,
            circuit: 5E4
        },
        prod: {
            hydrogen: -100
        },
        energy: 1E3,
        mult: {
            plastic: 1.25,
            circuit: 1.35
        },
        type: "energy",
        type2: "prod",
        environment: ["gas giant"],
        req: {
            nuclear: 5
        }
    }));
    buildings.push(new Building({
        name: "orbitalgen",
        req: {
            energetics: 2E3
        },
        displayName: "Orbital ",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "energy"
    }));
    buildings.push(new Building({
        name: "pressurized_ammonia",
        displayName: "Pressurized Ammonia Reactor",
        cost: {
            titanium: 2E5,
            plastic: 1E5,
            graphite: 5E5
        },
        prod: {
            pollution: 200,
            thorium: -5,
            ammonia: -20
        },
        mult: {
            titanium: 1.2,
            plastic: 1.3,
            graphite: 1.4
        },
        energy: 800,
        type: "energy",
        type2: "prod",
        environment: ["ammonia"],
        req: {
            ammonia_chemistry: 1
        }
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "lab",
        displayName: "Laboratory",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        researchPoint: 4,
        energy: -5,
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod",
        type: "research"
    }));
    buildings.push(new Building({
        name: "shipyard",
        displayName: "Shipyard",
        cost: {
            steel: 5E3,
            titanium: 1E3
        },
        mult: {
            steel: 2,
            titanium: 3.2
        },
        req: {
            astronomy: 1
        },
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "serra",
        displayName: "Greenhouse",
        cost: {
            steel: 1E5,
            titanium: 5E4,
            plastic: 1E4
        },
        prod: {
            water: -50,
            biomass: 10
        },
        mult: {
            steel: 2.2,
            titanium: 1.8,
            plastic: 1.4
        },
        type2: "prod",
        req: {
            environment: 1
        },
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "residential",
        displayName: "Residential Complex",
        cost: {
            iron: mi,
            steel: 1E5,
            titanium: 5E4
        },
        space: 2E3,
        mult: {
            iron: 1.3,
            steel: 1.3,
            titanium: 1.25
        },
        type2: "prod",
        req: {
            demographics: 1
        },
        environment: ["terrestrial", "ice", "desert", "metallic", "carbon"]
    }));
    buildings.push(new Building({
        name: "clonation",
        displayName: "Clonation Center",
        cost: {
            titanium: 1E5,
            circuit: 5E3
        },
        mult: {
            titanium: 1.8,
            circuit: 2
        },
        type2: "prod",
        req: {
            demographics: 10
        },
        environment: allEnvExt
    }));
    buildings.push(new Building({
        name: "aquarium",
        req: {
            demographics: 1
        },
        displayName: "Human Aquarium",
        cost: {
            steel: 2E5,
            plastic: 1E3
        },
        space: 8E3,
        mult: {
            steel: 1.3,
            plastic: 1.35
        },
        type2: "prod",
        environment: ["ammonia", "ocean"]
    }));
    buildings.push(new Building({
        name: "battery_charger",
        req: {
            electronics: 8
        },
        displayName: "Battery Charger",
        cost: {
            steel: 5E5,
            titanium: 1E5,
            plastic: 2E4
        },
        mult: {
            steel: 1.2,
            titanium: 1.2,
            plastic: 1.2
        },
        prod: {
            "empty battery": -1E4,
            "full battery": 1E4
        },
        energy: -250,
        type2: "prod",
        environment: allEnvExt
    }));
    buildings.push(new Building({
        name: "tradehub",
        displayName: "Trade Hub",
        cost: {
            steel: 5E4,
            titanium: 1E4
        },
        mult: {
            steel: 2,
            titanium: 3.2
        },
        req: {
            astronomy: 5
        },
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "oceanographic",
        displayName: "Oceanographic Center",
        cost: {
            steel: 2E4,
            titanium: 5E3
        },
        prod: {
            water: -2
        },
        energy: -50,
        researchPoint: 10,
        mult: {
            steel: 1.5,
            titanium: 2
        },
        type2: "prod",
        type: "research",
        environment: ["ocean", "ammonia"],
        req: {
            hydro: 0
        }
    }));
    buildings.push(new Building({
        name: "bioengineering",
        req: {
            environment: 1
        },
        displayName: "Bioengineering Center",
        cost: {
            titanium: 2E5,
            plastic: 5E3,
            circuit: 1E3
        },
        prod: {
            water: -5,
            biomass: -5
        },
        energy: -250,
        type: "research",
        researchPoint: 20,
        mult: {
            titanium: 2,
            plastic: 3,
            circuit: 4
        },
        type2: "prod",
        environment: allEnv
    }));
    buildings.push(new Building({
        name: "cryolab",
        type: "research",
        req: {
            ice: 12
        },
        displayName: "Cryogenic Laboratory",
        cost: {
            plastic: 3E5,
            circuit: 1E5
        },
        mult: {
            plastic: 1.25,
            circuit: 1.35
        },
        prod: {
            ice: -100
        },
        energy: -100,
        researchPoint: 1,
        type2: "prod",
        environment: ["ice", "radioactive"]
    }));
    buildings.push(new Building({
        name: "karanlab",
        req: {
            karan_nuclear: 1
        },
        displayName: "Karan Laboratory",
        cost: {
            titanium: 100 * mi,
            nanotubes: 2 * mi,
            engine: 25E4
        },
        mult: {
            titanium: 1.2,
            nanotubes: 1.3,
            engine: 1.2
        },
        prod: {
            thorium: -8,
            caesium: -4,
            uranium: -25
        },
        type2: "prod",
        type: "research",
        researchPoint: 8E3,
        energy: -1E3,
        environment: "ice metallic acid lava terrestrial desert".split(" ")
    }));
    buildings.push(new Building({
        name: "fluidod",
        type: "research",
        displayName: "Fluidodynamics Center",
        cost: {
            titanium: 1E4,
            plastic: 1E3
        },
        energy: -70,
        researchPoint: 10,
        mult: {
            titanium: 1.5,
            plastic: 2
        },
        prod: {
            hydrogen: -5
        },
        type2: "prod",
        environment: ["gas giant"]
    }));
    buildings.push(new Building({
        name: "karanlab2",
        req: {
            karan_nuclear: 1
        },
        displayName: "Karan Laboratory",
        cost: {
            titanium: 100 * mi,
            nanotubes: 2 * mi,
            engine: 25E4
        },
        mult: {
            titanium: 1.2,
            nanotubes: 1.3,
            engine: 1.2
        },
        prod: {
            thorium: -8,
            caesium: -4,
            uranium: -25
        },
        type2: "prod",
        type: "research",
        researchPoint: 16E3,
        energy: -1E3,
        environment: ["radioactive"]
    }));
    buildings.push(new Building({
        name: "floathaus",
        req: {
            demographics: 5
        },
        space: 1E3,
        displayName: "Orbital Colony",
        cost: {
            titanium: 15E4,
            circuit: 2E4,
            hydrogen: 1E4
        },
        mult: {
            titanium: 1.1,
            circuit: 1.2,
            hydrogen: 1.3
        },
        type2: "prod",
        environment: ["lava", "acid", "radioactive", "gas giant"]
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "turret",
        displayName: "Ballistic Cannon",
        cost: {
            steel: 25E4,
            titanium: 5E4,
            ammunition: 1E3
        },
        mult: {
            iron: 1,
            titanium: 1,
            steel: 1,
            plastic: 1
        },
        type: "defence",
        req: {
            military: 2
        }
    }));
    buildings.push(new Building({
        name: "laser",
        displayName: "Laser Turret",
        cost: {
            titanium: 1E5,
            plastic: 2E4
        },
        mult: {
            iron: 1,
            titanium: 1,
            steel: 1,
            plastic: 1
        },
        energy: -100,
        type: "defence",
        req: {
            military: 3
        }
    }));
    buildings.push(new Building({
        name: "shieldturret",
        displayName: "Shield Turret",
        cost: {
            steel: 1E6,
            titanium: 5E5,
            plastic: 1E5
        },
        mult: {
            iron: 1,
            titanium: 1,
            steel: 1,
            plastic: 1
        },
        energy: -150,
        type: "defence",
        req: {
            military: 4
        }
    }));
    buildings.push(new Building({
        name: "pierturret",
        displayName: "Armor Piercing Turret",
        cost: {
            titanium: 1E6,
            plastic: 2E5,
            ammunition: 1E5
        },
        mult: {
            iron: 1,
            titanium: 1,
            steel: 1,
            plastic: 1
        },
        type: "defence",
        req: {
            military: 5
        }
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "fissor",
        displayName: "Technetium Fissor",
        cost: {
            graphite: 5E6,
            nanotubes: 500
        },
        prod: {
            technetium: 1,
            uranium: -12
        },
        mult: {
            graphite: 1.25,
            nanotubes: 1.35
        },
        type: "prod",
        type2: "prod",
        req: {
            halean: 1
        },
        environment: allEnvRadio
    }));
    buildings.push(new Building({
        name: "haleanFusion",
        displayName: "Caesium Energy Station",
        cost: {
            technetium: 5E6,
            rhodium: 8E5
        },
        prod: {
            caesium: -3
        },
        mult: {
            technetium: 1.15,
            rhodium: 1.2
        },
        energy: 5E4,
        type: "energy",
        type2: "prod",
        req: {
            nononono: 15
        },
        environment: ["gas giant", "radioactive", "acid"]
    }));
    buildings.push(new Building({
        name: "haleanRobots",
        displayName: "Halean A.I. Center",
        cost: {
            circuit: 5E5,
            nanotubes: 2E3,
            technetium: 100
        },
        prod: {
            circuit: -50,
            technetium: -5,
            robots: 1,
            "full battery": -100
        },
        mult: {
            circuit: 1.5,
            nanotubes: 1.3,
            technetium: 1.2
        },
        energy: -500,
        type: "prod",
        type2: "prod",
        req: {
            halean: 1
        },
        environment: allEnvRadio
    }));
    buildings.push(new Building({
        name: "haleanResearch",
        type: "research",
        displayName: "Halean Laboratory",
        cost: {
            circuit: 5E5,
            nanotubes: 2E3,
            technetium: 100
        },
        researchPoint: 90,
        mult: {
            circuit: 1.5,
            nanotubes: 1.3,
            technetium: 1.2
        },
        environment: allEnvRadio,
        prod: {
            technetium: -2
        },
        energy: -500,
        type2: "prod",
        req: {
            halean: 1
        }
    }));
    buildings.push(new Building({
        name: "lavaresearch",
        type: "research",
        req: {
            vulcan: 1
        },
        displayName: "Vulcan Observatory",
        cost: {
            technetium: 1E5,
            graphite: 2 * mi
        },
        mult: {
            technetium: 1.35,
            graphite: 1.25
        },
        prod: {
            sulfur: -3
        },
        energy: -800,
        researchPoint: 1,
        type2: "prod",
        environment: ["lava", "acid"]
    }));
    buildings.push(new Building({
        name: "lavamine",
        req: {
            vulcan: 1
        },
        displayName: "Carbon-Sulfur Mine",
        cost: {
            technetium: 1E5,
            graphite: 1 * mi
        },
        mult: {
            technetium: 1.35,
            graphite: 1.25
        },
        prod: {
            sulfur: 3,
            graphite: 2
        },
        energy: -100,
        type: "mining",
        environment: ["lava", "radioactive", "acid"]
    }));
    buildings.push(new Building({
        name: "lavamine2",
        req: {
            vulcan: 1
        },
        displayName: "Lava Mine",
        cost: {
            technetium: 1E5,
            graphite: 1 * mi
        },
        mult: {
            technetium: 1.35,
            graphite: 1.25
        },
        prod: {
            titanium: 8
        },
        energy: -200,
        type: "mining",
        environment: ["lava", "acid"]
    }));
    buildings.push(new Building({
        name: "time_machine",
        displayName: "Wahrian Time Machine",
        cost: {
            iron: 500 * bi,
            steel: mi * mi,
            titanium: 10 * bi
        },
        mult: {
            iron: 1.5,
            steel: 2,
            titanium: 2.2
        },
        req: {
            secret: 1
        },
        environment: allEnvExt,
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "space_machine",
        displayName: "Wahrian Space Gate",
        cost: {
            iron: 500 * bi,
            steel: mi * mi,
            titanium: 10 * bi
        },
        mult: {
            iron: 1.5,
            steel: 2,
            titanium: 2.2
        },
        req: {
            secret: 1
        },
        environment: allEnvExt,
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "cryocell_fact",
        displayName: "Cryocell Facility",
        energy: -20,
        prod: {
            "empty cryocell": 1,
            ice: -3,
            steel: -35,
            titanium: -5
        },
        cost: {
            iron: 2E5,
            steel: 5E4,
            titanium: 1E3
        },
        mult: {
            iron: 1.3,
            steel: 1.35,
            titanium: 1.4
        },
        req: {
            ice: 2,
            demographics: 2
        },
        environment: allEnvExt,
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "hibernation",
        displayName: "Hibernation Chamber",
        energy: -50,
        prod: {
            "loaded cryocell": 10,
            "empty cryocell": -10
        },
        population: -10,
        cost: {
            iron: 25E5,
            steel: 5E5,
            titanium: 1E4
        },
        mult: {
            iron: 1.3,
            steel: 1.35,
            titanium: 1.4
        },
        req: {
            ice: 2,
            demographics: 2
        },
        environment: allEnvExt,
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "dehibernation",
        displayName: "Dehibernation Chamber",
        energy: -50,
        prod: {
            "loaded cryocell": -10,
            "empty cryocell": 10
        },
        population: 10,
        cost: {
            iron: 25E5,
            steel: 5E5,
            titanium: 1E4
        },
        mult: {
            iron: 1.3,
            steel: 1.35,
            titanium: 1.4
        },
        req: {
            ice: 2,
            demographics: 2
        },
        environment: allEnvExt,
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "placeholder",
        req: {
            nononono: 1
        },
        displayName: "placeholder",
        cost: {
            iron: 1E3,
            steel: 200,
            titanium: .01
        },
        mult: {
            iron: 2,
            steel: 3,
            titanium: 4
        },
        type2: "prod"
    }));
    buildings.push(new Building({
        name: "turret",
        displayName: " Turret",
        cost: {
            iron: mi,
            steel: 1E5,
            titanium: 5E4,
            plastic: 1E3
        },
        mult: {
            iron: 1,
            titanium: 1,
            steel: 1,
            plastic: 1
        },
        energy: 0,
        type: "mining",
        req: {
            nononono: 4
        }
    }));
    for (k = 0; k < buildings.length; k++) buildings[k].id = k, buildings[k].civis = i;
    civis[i].buildings = buildings
}
buildings = civis[0].buildings;
var buildingsName = [];
for (i = 0; i < buildings.length; i++) buildingsName[buildings[i].name] = i;
var energyBuildings = [],
    unenergyBuildings = [];
for (i = 0; i < buildings.length; i++) 0 < buildings[i].energy ? energyBuildings.push(i) : 0 > buildings[i].energy && unenergyBuildings.push(i);
for (i = 0; i < planets.length; i++)
    for (planets[i].globalNoRes = Array(buildings.length), k = 0; k < buildings.length; k++) {
        planets[i].globalNoRes[k] = Array(resNum);
        for (var s = 0; s < resNum; s++) planets[i].globalNoRes[k][s] = !1;
        planets[i].structure[k] = new PlanetBuilding(i, k, 0)
    }
planets[planetsName.promision].structure[0].number = 1;
planets[planetsName.promision].population = 1E3;

function Strategy(b, e) {
    this.lastDecision = (new Date).getTime();
    this.rpvalue = 0;
    this.researchImportance = e || 1;
    this.civis = b;
    this.recursion = 0;
    this.build = function (b, e, g, l) {
        this.recursion++;
        if (512 < this.recursion) return !1;
        for (var d = e.resourcesProd, h = b.rawProduction(), x = !0, C = 0; C < resNum; C++)
            if (h[C] += b.globalImport[C] - b.globalExport[C], 0 > d[C] + h[C] && l != C && !(0 == b.baseResources[C] && b.resources[C] < b.structure[e.id].cost(C))) {
                for (var E = !0, F = [], z = 0; z < g.buildings.length; z++) 0 < g.buildings[z].resourcesProd[C] && g.buildings[z].show(b) ?
                    (F[z] = b.structure[z].value(), E = !1) : F[z] = -1E14;
                E || (E = F.idMax(), E != e.id && (this.build(b, g.buildings[E], g, l) || (x = !1)))
            }
        if (0 > e.energy + b.energyProduction() + b.energyConsumption()) {
            E = !0;
            F = [];
            for (z = 0; z < g.buildings.length; z++) 0 < g.buildings[z].energy && g.buildings[z].show(b) ? (F[z] = b.structure[z].value(), E = !1) : F[z] = -1E14;
            E || (E = F.idMax(), E != e.id && (this.build(b, g.buildings[E], g, "energy") || (x = !1)))
        }
        if (x) {
            if (b.buyStructure(e.id)) return console.log("Build " + e.displayName), !0;
            console.log("To queue " + e.displayName);
            b.compactQueue();
            l = 0;
            for (d = !1; !d && b.queue[l];) b.queue[l].b == e.id && (d = !0), l++;
            d || (b.addQueue(e.id, 1), console.log("QUEUEd " + e.displayName));
            for (l = 0; l < resNum; l++)
                if (b.resources[l] < b.structure[e.id].cost(l)) {
                    E = !0;
                    F = [];
                    for (z = 0; z < g.buildings.length; z++) 0 < g.buildings[z].resourcesProd[l] && g.buildings[z].show(b) ? (F[z] = b.structure[z].value(), E = !1) : F[z] = -1E14;
                    E || (E = F.idMax(), b.buyStructure(E), console.log("Build " + buildings[E].displayName))
                }
        }
        return !1
    };
    this.decide = function (b) {
        if (3E3 <= (new Date).getTime() - this.lastDecision) {
            this.lastDecision =
                (new Date).getTime();
            if (1 < b.planets.length) {
                for (var d = 0; d < b.planets.length; d++) {
                    for (var e = planets[b.planets[d]], l = [], m = 0; m < resNum; m++) l[m] = 0;
                    for (var t = 0; t < buildings.length; t++)
                        if (0 < e.structure[t].number && e.structure[t].active) {
                            var x = game.buildings[t].rawProduction(e);
                            for (m = 0; m < resNum; m++) e.globalNoRes[t][m] && (l[m] += x[m])
                        }
                }
                for (m = 0; m < resNum; m++) 0 < l[m] && (l[m] += Math.max(globalExport[m] - globalImport[m], 0))
            }
            for (d = 0; d < b.planets.length; d++) {
                x = b.planets[d];
                e = planets[x].rawProduction();
                t = [];
                for (m = 0; m < resNum; m++) l =
                    planets[x].baseResources[m], t[m] = 0 < l ? e[m] / (resources[m].value * (Math.exp(-(l - 4) * (l - 4) / 4) + Math.exp(-(l - 2) * (l - 2)) + .01)) : 1E15;
                e = t.idMin();
                m = t[e];
                t[e] = t.max();
                l = t.idMin();
                t[e] = m;
                t.energy = (planets[x].energyProduction() + planets[x].energyConsumption()) / resources.energy.value;
                t.energy < t[e] ? e = "energy" : t.energy < t[l] && (l = "energy");
                if (this.rpvalue > resources[e].value) this.build(planets[x], b.buildings[buildingsName.lab], b, "research"), this.rpvalue = 0;
                else {
                    t = 0;
                    var C = [];
                    m = !1;
                    for (var E = 0; 2 > E;) {
                        for (t = 0; t < b.buildings.length; t++) "energy" !=
                            e ? 0 < b.buildings[t].resourcesProd[e] && b.buildings[t].show(planets[x]) ? (C[t] = planets[x].structure[t].value(), m = !0) : C[t] = -1E14 : 0 < b.buildings[t].energy && b.buildings[t].show(planets[x]) ? (C[t] = planets[x].structure[t].value(), m = !0) : C[t] = -1E14;
                        t = C.idMax();
                        m || (e = l);
                        E++
                    }
                    this.recursion = 0;
                    m && this.build(planets[x], buildings[t % buildings.length], b, e)
                }
            }
            d = [];
            for (m = 0; m < b.researches.length; m++) b.researches[m].requirement() ? d.push(b.researches[m].value()) : d.push(-1E8);
            m = !1;
            x = t = 0;
            do b.researches[t].requirement() && (t =
                d.idMax(), b.researches[t].cost() <= b.researchPoint ? (b.researches[t].buy(), m = !0) : d[t] = d.min() - 1), x++; while (!m && x < b.researches.lenth);
            e = [];
            for (m = 0; m < b.researches.length; m++) e.push(b.researches[m].cost());
            m = 0;
            l = [];
            for (d = 0; d < b.planets.length; d++) {
                for (t = 0; t < b.buildings.length; t++) x = b.buildings[t].production(planets[d]), m += x.researchPoint;
                l.push(m)
            }(e.max() > 1E3 * m * this.researchImportance || 0 == m) && this.rpvalue++
        }
    }
}
var nebulas = [];
nebulas[0] = new Nebula("Perseus Arm", "swan.png");
nebulas[1] = new Nebula("Andromeda Heart", "andro.png");
nebulas[2] = new Nebula("Demilitarized Zone", "green.png");
nebulas[3] = new Nebula("Cassiopeia Eye", "green.png");
nebulas[4] = new Nebula("Bonasorte Nebula", "bonasorte.png");
nebulas[5] = new Nebula("Crimson Nebula", "crimson.png");
for (i = 0; i < nebulas.length; i++) nebulas[i].av = !0, nebulas[i].id = i;
var pAR = [];
for (i = 0; i < Math.min(30, planets.length); i++) pAR.push(planets[i].id);
pAR.push(41);
nebulas[0].pushPlanet2(pAR);
nebulas[0].av = !1;
pAR = [];
for (i = 42; i < planets.length; i++) pAR.push(planets[i].id);
nebulas[1].pushPlanet2(pAR);
nebulas[1].av = !1;
nebulas[2].pushPlanet2([]);
nebulas[2].av = !1;
nebulas[3].pushPlanet2([]);
nebulas[3].av = !1;
nebulas[4].pushPlanet2([]);
nebulas[4].av = !1;
var ships = [],
    sss = new Ship({
        weapon: "unarmed",
        icon: "vitha",
        name: "Vitha Colonial Ship",
        req: 1,
        type: "Colonial Ship",
        novalue: 1,
        power: 0,
        armor: 1,
        speed: .3,
        storage: 0,
        cost: {
            iron: 5E4,
            steel: 8E4,
            titanium: 5E3
        },
        fuel: "fuel",
        weight: 2,
        hp: 1
    });
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "unarmed",
    icon: "zb03",
    name: "ZB-03 Small Cargo",
    type: "Cargoship",
    novalue: 1,
    req: 1,
    power: 0,
    armor: 1,
    speed: .3,
    storage: 1E4,
    cost: {
        steel: 8E4,
        titanium: 5E3
    },
    fuel: "fuel",
    weight: 2200,
    combatWeight: 2,
    hp: 2
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "unarmed",
    icon: "zb04",
    name: "ZB-04 Hauler",
    type: "Cargoship",
    novalue: 1,
    req: 2,
    power: 0,
    armor: 1,
    speed: .5,
    storage: 8E3,
    cost: {
        steel: 8E4,
        titanium: 1E4
    },
    fuel: "fuel",
    weight: 2E3,
    combatWeight: 2,
    hp: 2
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    icon: "ark_22",
    name: "ARK-22",
    type: "Fighter",
    req: 3,
    power: 10,
    armor: 100,
    speed: 2.8,
    storage: 100,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 200
    },
    fuel: "uranium",
    weight: 100,
    hp: 70
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    icon: "ark_55",
    name: "ARK-55",
    type: "H.Fighter",
    req: 4,
    power: 6,
    armor: 800,
    speed: 2.3,
    storage: 500,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 200
    },
    fuel: "uranium",
    weight: 150,
    hp: 180
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    icon: "foxar",
    name: "Foxar",
    type: "Frigate",
    req: 5,
    power: 120,
    armor: 2E3,
    speed: 1.8,
    storage: 5E3,
    cost: {
        titanium: 1E5,
        plastic: 5E3,
        circuit: 500
    },
    fuel: "uranium",
    weight: 550,
    hp: 850
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    icon: "sky_dragon",
    name: "Sky Dragon",
    type: "Assault Frigate",
    req: 6,
    power: 80,
    armor: 5E3,
    speed: 1.3,
    storage: 1E4,
    cost: {
        titanium: 8E4,
        plastic: 8E3,
        circuit: 500
    },
    fuel: "uranium",
    weight: 800,
    hp: 2200
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "unarmed",
    icon: "zb22",
    name: "ZB-22 Transporter",
    type: "Cargoship",
    novalue: 1,
    req: 7,
    power: 0,
    armor: 5,
    speed: 1.2,
    storage: 2E5,
    cost: {
        titanium: 1E5,
        plastic: 2E4,
        circuit: 500
    },
    fuel: "uranium",
    weight: 2500,
    combatWeight: 2,
    hp: 10
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "babayaga",
    name: "Babayaga",
    type: "Destroyer",
    req: 8,
    power: 600,
    armor: 8E3,
    speed: 1,
    storage: 1E5,
    cost: {
        plastic: 25E3,
        circuit: 2E3,
        ammunition: 550
    },
    fuel: "hydrogen",
    weight: 1500,
    hp: 5E3
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "unarmed",
    icon: "zb50",
    name: "ZB-50 Big Cargo",
    type: "Cargoship",
    novalue: 1,
    req: 9,
    power: 0,
    armor: 10,
    speed: .8,
    storage: 5 * mi,
    fuel: "hydrogen",
    weight: 3500,
    combatWeight: 35,
    hp: 20,
    cost: {
        plastic: 35E3,
        circuit: 1500
    }
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    icon: "luxis",
    name: "Luxis",
    type: "Incursor",
    req: 10,
    power: 500,
    piercing: 25,
    armor: 1E3,
    speed: 5.2,
    storage: 100,
    fuel: "hydrogen",
    weight: 220,
    hp: 5E3,
    cost: {
        circuit: 15E3,
        ammunition: 1E4,
        nanotubes: 3300
    }
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "muralla",
    name: "Muralla",
    type: "Shield Ship",
    req: 10,
    shield: 8E4,
    power: 11,
    armor: 5E4,
    speed: .15,
    storage: 0,
    fuel: "hydrogen",
    weight: 22E3,
    hp: 6E4,
    cost: {
        circuit: 5E3,
        ammunition: 1E4,
        nanotubes: 12E3
    }
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "siber",
    name: "Siber",
    type: "Battlecruiser",
    req: 11,
    shield: 3E4,
    piercing: 8,
    power: 1E4,
    armor: 25E3,
    speed: .7,
    storage: 1 * mi,
    fuel: "hydrogen",
    weight: 4E3,
    hp: 15E3,
    cost: {
        ammunition: 7E4,
        nanotubes: 15E3,
        robots: 150
    }
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Mankind Gem",
    type: "Bomber",
    req: 12,
    shield: 1E5,
    power: 4200,
    armor: 1E5,
    speed: .3,
    storage: 2 * mi,
    fuel: "hydrogen",
    weight: 15E3,
    hp: 11E4,
    cost: {
        ammunition: 1E5,
        nanotubes: 25E3,
        robots: 250
    }
});
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "alkantara",
    name: "Alkantara",
    type: "Admiral",
    req: 13,
    shield: 5E4,
    power: 21E3,
    armor: 3E5,
    speed: .15,
    storage: 2 * mi,
    fuel: "hydrogen",
    weight: 55E3,
    hp: 6E5,
    cost: {
        ammunition: 25E4,
        nanotubes: 5E4,
        robots: 1800
    },
    special: {
        desc: "<span style='float:left;margin-left:16px;' class='gold_text'>Fleet's total power will increase by</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>10%*log2(1+alkantara_number)</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>It means, each time you double the</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>number of alkantara in the fleet</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>you get another +10% bonus</span><span></span>"
    }
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Glass Burson",
    type: "Battleship",
    power: 2800,
    armor: 12E3,
    speed: .5,
    storage: 1.2 * mi,
    fuel: "hydrogen",
    weight: 15300,
    hp: 1E4
});
ships.push(sss);
civis[1].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "The Key",
    type: "Admiral",
    power: 4E3,
    armor: 18E3,
    speed: .3,
    storage: 5 * mi,
    fuel: "hydrogen",
    weight: 13E3,
    hp: 103E3
});
ships.push(sss);
civis[1].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Black Star",
    type: "Orbital Defence",
    power: 57E6,
    armor: 8E5,
    speed: .1,
    storage: 30 * mi,
    fuel: "hydrogen",
    weight: 8E5,
    hp: 5E8
});
ships.push(sss);
civis[7].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Marduk",
    type: "Orbital Defence",
    power: 100 * mi,
    armor: 500 * mi,
    speed: .1,
    storage: 80,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 28E6,
    hp: 2E6 * mi
});
ships.push(sss);
civis[8].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "ARK-55b",
    type: "Fighter",
    req: 4,
    power: 6,
    armor: 500,
    speed: 1.4,
    storage: 50,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 150,
    hp: 50
});
ships.push(sss);
civis[1].ships.push(sss);
civis[7].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "ARK-PRP",
    type: "H.Fighter",
    req: 4,
    power: 26,
    armor: 1500,
    speed: 1.4,
    storage: 100,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 180,
    hp: 200
});
ships.push(sss);
civis[1].ships.push(sss);
civis[7].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "No Name Ship",
    type: "Frigate",
    req: 4,
    power: 180,
    armor: 2900,
    speed: 1.5,
    storage: 5E3,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 500,
    hp: 200
});
ships.push(sss);
civis[7].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Angel Eyes",
    type: "Frigate",
    req: 4,
    power: 260,
    armor: 5E3,
    speed: 1.5,
    storage: 5E3,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 500,
    hp: 200
});
ships.push(sss);
civis[7].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Tuco Ramirez",
    type: "H.Fighter",
    req: 4,
    power: 150,
    armor: 1500,
    speed: 1.8,
    storage: 5E3,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 350,
    hp: 200
});
ships.push(sss);
civis[7].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Aurora",
    type: "Capital Ship",
    req: 4,
    power: 15E4,
    armor: 25E3,
    speed: .1,
    storage: 5E7,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 8200,
    hp: 8E5
});
ships.push(sss);
civis[8].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Mastodon",
    type: "Capital Ship",
    req: 4,
    power: 22E5,
    armor: 5E5,
    speed: .2,
    storage: 5E7,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 16E4,
    hp: 5E6
});
ships.push(sss);
civis[2].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Die Schoene",
    type: "Admiral",
    req: 4,
    power: 3E5,
    armor: 12E4,
    speed: .4,
    storage: 5E7,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "hydrogen",
    weight: 55E3,
    hp: 12E5
});
ships.push(sss);
civis[9].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Alptraum",
    type: "Battlecruiser",
    req: 11,
    power: 6600,
    armor: 600,
    speed: .9,
    storage: 1.5 * mi,
    fuel: "hydrogen",
    weight: 5600,
    hp: 9E3,
    cost: {
        ammunition: 1E5,
        nanotubes: 1E5,
        robots: 1E3
    }
});
ships.push(sss);
civis[9].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Engel",
    type: "Destroyer",
    req: 8,
    power: 600,
    armor: 150,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 1800,
    hp: 3E3
});
ships.push(sss);
civis[9].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "natsumiko",
    name: "U.N.I.T Natsumiko",
    type: "Battleship",
    req: 8,
    power: 3E6,
    armor: 2E5,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 3800,
    hp: 2E6
});
ships.push(sss);
civis[6].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "harumiko",
    name: "U.N.I.T Harumiko",
    type: "Battleship",
    req: 8,
    power: 2E6,
    armor: 5E5,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 3800,
    hp: 5E6
});
ships.push(sss);
civis[6].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "akimiko",
    name: "U.N.I.T Akimiko",
    type: "Battleship",
    req: 8,
    power: 2E6,
    armor: 5E5,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 3800,
    hp: 5E6
});
ships.push(sss);
civis[6].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    icon: "fuyumiko",
    name: "U.N.I.T Fuyumiko",
    type: "Battleship",
    req: 8,
    power: 1E6,
    armor: 8E5,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 3800,
    hp: 8E6
});
ships.push(sss);
civis[6].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Auxilia",
    type: "Assault ship",
    req: 14,
    power: 5800,
    armor: 3200,
    speed: 2.7,
    storage: 100,
    cost: {
        technetium: 300,
        "t-ammunition": 10
    },
    fuel: "hydrogen",
    weight: 1340,
    hp: 380,
    resReq: {
        artofwar: 3
    }
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Augustus",
    type: "Battlecruiser",
    req: 8,
    power: 15 * mi,
    armor: 1.2 * mi,
    speed: .7,
    storage: 100,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 6E3,
    hp: 100 * mi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Leonidas",
    type: "Battlecruiser",
    req: 8,
    power: 70 * mi,
    armor: 4 * mi,
    speed: .7,
    storage: 100,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 8E3,
    hp: 200 * mi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Alexander",
    type: "Battlecruiser",
    req: 8,
    power: 180 * mi,
    armor: 15 * mi,
    speed: .7,
    storage: 100,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 12E3,
    hp: 800 * mi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Cerberus",
    type: "Battleship",
    req: 8,
    power: 200 * mi,
    armor: 20 * mi,
    speed: .4,
    storage: 100,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 18E3,
    hp: 400 * mi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Charon",
    type: "Battleship",
    req: 8,
    power: 300 * mi,
    armor: 10 * mi,
    speed: .4,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 22800,
    hp: 400 * mi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Lucifer",
    type: "Admiral",
    req: 8,
    power: 1.3 * bi,
    armor: 50 * mi,
    speed: .2,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 3E4,
    hp: 5 * bi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "technetium",
    name: "Dead Soul",
    type: "Destroyer",
    req: 8,
    power: 10 * mi,
    armor: 8E4,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 1800,
    hp: 35 * mi
});
ships.push(sss);
civis[5].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Halean Spear",
    type: "Incursor",
    power: 1E4,
    armor: 2E3,
    speed: 4.8,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 2E4,
    weight: 800
});
ships.push(sss);
civis[4].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Halean Counselor Ship",
    type: "Diplomatic Vessel",
    power: 9E4,
    armor: 8E3,
    speed: 1.2,
    storage: 2E5,
    fuel: "rhodium",
    hp: 12E4,
    weight: 580
});
ships.push(sss);
civis[4].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Juini's Daughter",
    type: "Destroyer",
    power: 15 * mi,
    armor: 2 * mi,
    speed: 1.2,
    storage: 24 * mi,
    fuel: "rhodium",
    hp: 872E4,
    weight: 1800
});
ships.push(sss);
civis[4].ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Azure Huang",
    type: "Battleship",
    power: 221 * mi,
    armor: 5 * mi,
    speed: .5,
    storage: 24 * mi,
    fuel: "rhodium",
    hp: 872E4,
    weight: 5E3
});
ships.push(sss);
civis[4].ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Dream of Juini",
    type: "Capital Ship",
    power: 50 * mi,
    armor: 1 * mi,
    speed: .2,
    storage: 100 * bi,
    fuel: "rhodium",
    hp: bi,
    weight: mi
});
ships.push(sss);
civis[4].ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Siren",
    type: "Frigate",
    req: 8,
    power: 1E6,
    armor: 27E3,
    speed: 1.7,
    storage: 1E5,
    cost: {
        plastic: 2E5,
        circuit: 2E4,
        ammunition: 500
    },
    fuel: "hydrogen",
    weight: 1E3,
    hp: 8E6
});
ships.push(sss);
civis[4].ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Servant of the Swarm",
    type: "Servant Ship",
    power: 3E4,
    armor: 1E4,
    speed: 5.8,
    storage: 1E3,
    fuel: "rhodium",
    hp: 2E4,
    weight: 100
});
ships.push(sss);
civis[3].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Enslaved Human Ship",
    type: "Servant Ship",
    power: 2 * mi,
    armor: 5E5,
    speed: 1.8,
    storage: 1E4,
    fuel: "rhodium",
    hp: 2 * mi,
    weight: 1E4
});
ships.push(sss);
civis[3].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Enslaved Quris Ship",
    type: "Servant Ship",
    power: 3 * mi,
    armor: 2.5 * mi,
    speed: 2.8,
    storage: 1E4,
    fuel: "rhodium",
    hp: 5 * mi,
    weight: 1E3
});
ships.push(sss);
civis[3].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Enslaved Halean Ship",
    type: "Servant Ship",
    power: 5 * mi,
    armor: mi,
    speed: 3.8,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 3 * mi,
    weight: 2500
});
ships.push(sss);
civis[3].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Heart of the Swarm",
    type: "Mother Ship",
    power: 2 * bi,
    armor: 200 * mi,
    speed: .8,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 1.6 * bi,
    weight: 1E5
});
ships.push(sss);
civis[3].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Aurea Spina",
    type: "Mother Ship",
    power: 20 * bi,
    armor: 10 * bi,
    speed: .1,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 15 * bi,
    weight: mi
});
ships.push(sss);
civis[3].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    icon: "auxilia",
    name: "Auxilia Beta",
    type: "Assault ship",
    req: 14,
    power: 5800,
    armor: 3200,
    speed: 1.7,
    storage: 100,
    cost: {
        technetium: 300,
        "t-ammunition": 10
    },
    fuel: "hydrogen",
    weight: 1340,
    hp: 380,
    resReq: {
        artofwar: 3
    }
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    icon: "servant",
    name: "Re-engineered Servant",
    req: 15,
    type: "Servant Ship",
    power: 3E4,
    armor: 1E4,
    speed: 2.8,
    storage: 10,
    cost: {
        silicon: 5E4,
        rhodium: 1500,
        "mK Embryo": 10
    },
    fuel: "rhodium",
    resReq: {
        osmium: 1
    },
    hp: 2E4,
    weight: 130
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Cherub",
    type: "Destroyer",
    shield: 3E3,
    power: 12E4,
    armor: 1E4,
    speed: 1.8,
    storage: 1 * mi,
    fuel: "rhodium",
    hp: 1.8 * mi,
    weight: 3980
});
ships.push(sss);
civis[10].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Seraph",
    type: "Battlecruiser",
    shield: 5E3,
    power: 6 * mi,
    armor: 5E4,
    speed: .7,
    storage: 1 * mi,
    fuel: "rhodium",
    hp: 20 * mi,
    weight: 11E3
});
ships.push(sss);
civis[10].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Jericho",
    type: "Orbital Defence",
    shield: 1E4,
    power: 2E3 * bi,
    armor: 50 * bi,
    speed: .1,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 200 * bi,
    weight: bi
});
ships.push(sss);
civis[10].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Sodom",
    type: "Orbital Defence",
    shield: 1E4,
    power: 1E3 * bi,
    armor: 20 * bi,
    speed: .1,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 130 * bi,
    weight: bi
});
ships.push(sss);
civis[10].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Gomorrah",
    type: "Orbital Defence",
    shield: 1E4,
    power: 1E3 * bi,
    armor: 20 * bi,
    speed: .1,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 130 * bi,
    weight: bi
});
ships.push(sss);
civis[10].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Zion",
    type: "Orbital Defence",
    shield: 1E4,
    power: 500 * bi,
    armor: 10 * bi,
    speed: .1,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 50 * bi,
    weight: bi
});
ships.push(sss);
civis[10].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Aster",
    type: "Orbital Defence",
    shield: 1E4,
    power: 8E3 * bi,
    armor: bi,
    speed: 2.2,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 1E3 * bi,
    weight: 100 * mi
});
ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Azalea",
    type: "Orbital Defence",
    shield: 1E4,
    power: 21E3 * bi,
    armor: 2 * bi,
    speed: 3.3,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 1200 * bi,
    weight: 200 * mi
});
ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Dahlia",
    type: "Orbital Defence",
    shield: 1E4,
    power: 56E3 * bi,
    armor: 3 * bi,
    speed: 4.4,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 1500 * bi,
    weight: 300 * mi
});
ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Freesia",
    type: "Orbital Defence",
    shield: 1E4,
    power: 124E3 * bi,
    armor: 4 * bi,
    speed: 5.5,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 1700 * bi,
    weight: 500 * mi
});
ships.push(sss);
civis[11].ships.push(sss);
civis[14].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Castilla",
    type: "Shield Ship",
    shield: 3E4,
    power: 80,
    armor: mi,
    speed: .05,
    storage: 10 * mi,
    fuel: "rhodium",
    hp: 5 * mi,
    weight: 1E4
});
ships.push(sss);
civis[12].ships.push(sss);
civis[15].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Devil in Disguise",
    type: "Incursor",
    power: 124E3,
    armor: 5E4,
    speed: 4,
    storage: 1E3,
    fuel: "rhodium",
    hp: 25E3,
    weight: 500
});
ships.push(sss);
civis[12].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Salantara",
    type: "Capital Ship",
    shield: 1E4,
    req: 14,
    power: 4E3 * bi,
    armor: bi,
    speed: 3.12,
    storage: 10 * mi,
    fuel: "hydrogen",
    weight: bi,
    hp: 2E3 * bi,
    cost: {
        "u-ammunition": 2E5,
        armor: 5E5,
        nanotubes: 3E5,
        robots: 15E3
    }
});
ships.push(sss);
civis[12].ships.push(sss);
civis[15].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Bellerophon",
    type: "Imperial Ship",
    shield: 5E4,
    req: 14,
    power: 25E3 * bi,
    armor: 8 * bi,
    speed: 5.25,
    storage: 5 * mi,
    fuel: "hydrogen",
    weight: 1.5 * bi,
    hp: 4E3 * bi,
    cost: {
        ammunition: 5E5,
        nanotubes: 15E4,
        robots: 8E3
    }
});
ships.push(sss);
civis[12].ships.push(sss);
civis[15].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Wings of Pegasus",
    type: "Imperial Ship",
    shield: 1E5,
    req: 15,
    power: 1E5 * bi,
    armor: 25 * bi,
    speed: 7.25,
    storage: 8 * mi,
    fuel: "hydrogen",
    weight: 5 * bi,
    hp: 15E3 * bi,
    cost: {
        ammunition: 15E5,
        nanotubes: 5E5,
        robots: 3E4
    }
});
civis[12].ships.push(sss);
civis[15].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "laser",
    icon: "orion",
    name: "Orion Cargo",
    type: "Cargoship",
    novalue: 1,
    req: 14,
    power: 33,
    armor: 20,
    speed: 1.5,
    storage: 250 * mi,
    fuel: "hydrogen",
    weight: 5 * mi,
    combatWeight: 2,
    hp: 150,
    cost: {
        robots: 200,
        nanotubes: 2E4
    }
});
civis[0].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Orion League Delivery Vessel",
    type: "Cargoship",
    novalue: 1,
    req: 14,
    power: 33 * mi,
    armor: 20 * mi,
    speed: .5,
    storage: 100 * mi,
    fuel: "hydrogen",
    weight: 5 * mi,
    combatWeight: 2,
    hp: mi,
    cost: {
        robots: 100,
        nanotubes: 1E4
    }
});
ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    icon: "anger",
    name: "Anger of Perseus",
    type: "Capital Ship",
    resReq: {
        quantum: 3
    },
    req: 16,
    shields: mi,
    power: 300 * mi,
    armor: 50 * mi,
    speed: .035,
    storage: 100 * mi,
    fuel: "hydrogen",
    weight: 5 * mi,
    hp: 5 * bi,
    cost: {
        iron: 200 * bi,
        steel: 2 * tri,
        titanium: 50 * bi,
        nanotubes: 500 * mi,
        ammunition: bi,
        "full battery": 350 * mi,
        "u-ammunition": 100 * mi,
        armor: 10 * mi,
        robots: mi,
        engine: 3E5,
        antimatter: 1E4
    },
    special: {
        desc: "<span style='float:left;margin-left:16px;' class='red_text'>The Anger of Perseus will enter a</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>'berserk mode' when the player's OR</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>the enemy fleet's HP drop below 15%.</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>In this mode, your fleet will get +50%</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>piercing power and will do 50% more</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>damage for each Anger of Perseus</span><br>"
    }
});
civis[0].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "unarmed",
    icon: "miner",
    name: "Medusa Miner",
    type: "Miner Ship",
    novalue: 1,
    resReq: {
        space_mining: 1
    },
    req: 18,
    power: 0,
    armor: 1,
    speed: .5,
    storage: 0,
    fuel: "hydrogen",
    weight: 100 * mi,
    combatWeight: 2,
    hp: 10,
    cost: {
        iron: 300 * mi,
        steel: bi,
        titanium: 100 * mi,
        nanotubes: mi,
        "full battery": 25E4,
        robots: 1E5,
        engine: 500
    },
    special: {
        desc: "<span style='float:left;margin-left:16px;' class='gold_text'>Each Medusa Miner placed in orbit</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>will boost extraction buildings by</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>20%*number_miners/log(2+number_miners)</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>It means, 1 miner will give you 12%</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>two miners 20% (like before), three miners 25.8%,</span><span></span><br><span style='float:left;margin-left:16px;' class='gold_text'>ten miners 55.8%, 100 miners 300%, and so on</span><span></span>"
    }
});
civis[0].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Nux",
    type: "Assault Frigate",
    power: 2E5,
    armor: 1E5,
    speed: 2,
    storage: 0,
    fuel: "hydrogen",
    weight: 3800,
    hp: mi,
    cost: {}
});
civis[13].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Max",
    type: "Destroyer",
    power: mi,
    armor: 15E4,
    speed: 1.5,
    storage: 0,
    fuel: "hydrogen",
    weight: 8E3,
    hp: 5E5,
    cost: {}
});
civis[13].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Furiosa",
    type: "Incursor",
    power: mi,
    armor: 1E4,
    piercing: 5,
    speed: 5.5,
    storage: 0,
    fuel: "hydrogen",
    weight: 500,
    hp: 8E3,
    cost: {}
});
civis[13].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "Angharad",
    type: "Battlecruiser",
    power: tri,
    armor: bi,
    speed: 1.5,
    storage: 0,
    fuel: "hydrogen",
    weight: bi,
    hp: 100 * bi,
    cost: {}
});
civis[13].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "thermal",
    name: "The Ace",
    type: "Capital Ship",
    power: 2800 * tri,
    armor: tri,
    speed: 3.5,
    storage: 0,
    fuel: "hydrogen",
    weight: tri,
    hp: 6200 * bi,
    cost: {}
});
civis[13].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Sean",
    type: "Capital Ship",
    power: 1E4 * tri,
    armor: tri,
    speed: 15.5,
    storage: 0,
    fuel: "hydrogen",
    weight: 10 * tri,
    hp: 5E4 * tri,
    cost: {}
});
civis[14].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Dion",
    type: "Capital Ship",
    power: 5E4 * tri,
    armor: 100 * tri,
    speed: 5.5,
    storage: 0,
    fuel: "hydrogen",
    weight: 10 * tri,
    hp: 8E4 * tri,
    cost: {}
});
civis[14].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Gradh",
    type: "Capital Ship",
    power: 3E4 * tri,
    armor: tri,
    speed: 8.5,
    storage: 0,
    fuel: "hydrogen",
    weight: 10 * tri,
    hp: 15E4 * tri,
    cost: {}
});
civis[14].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Alecto",
    type: "Imperial Ship",
    power: 100 * tri,
    armor: tri,
    speed: 6,
    storage: 0,
    fuel: "hydrogen",
    weight: 10 * tri,
    hp: 1500 * tri,
    cost: {}
});
civis[15].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Maegera",
    type: "Imperial Ship",
    power: 500 * tri,
    armor: tri,
    speed: 6,
    storage: 0,
    fuel: "hydrogen",
    weight: 10 * tri,
    hp: 3500 * tri,
    cost: {}
});
civis[15].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Tisiphon",
    type: "Imperial Ship",
    power: 8E3 * tri,
    armor: tri,
    speed: 6,
    storage: 0,
    fuel: "hydrogen",
    weight: 10 * tri,
    hp: 55E3 * tri,
    cost: {}
});
civis[15].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Light's Mexager",
    type: "Destroyer",
    power: 1E3 * tri,
    armor: tri,
    speed: 51,
    storage: 0,
    fuel: "hydrogen",
    weight: tri,
    hp: 8E3 * tri,
    cost: {}
});
civis[16].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Light's Companion",
    type: "Destroyer",
    power: 12E3 * tri,
    armor: tri,
    speed: 34,
    storage: 0,
    fuel: "hydrogen",
    weight: tri,
    hp: 26E3 * tri,
    cost: {}
});
civis[16].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Vela",
    type: "Battlecruiser",
    power: 12E4 * tri,
    armor: 1E3 * tri,
    speed: 12,
    storage: 0,
    fuel: "hydrogen",
    weight: 5 * tri,
    hp: 7E5 * tri,
    cost: {}
});
civis[16].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "Yola",
    type: "Battleship",
    power: 54E5 * tri,
    armor: 1E6 * tri,
    speed: 8,
    storage: 0,
    fuel: "hydrogen",
    weight: 50 * tri,
    hp: 11E6 * tri,
    cost: {}
});
civis[16].ships.push(sss);
ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Ambjenze",
    type: "Frigate",
    req: 4,
    power: 5E3,
    armor: 3E3,
    speed: 1.5,
    storage: 50,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 1600,
    hp: 5E3
});
ships.push(sss);
civis[2].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Zannsarig",
    type: "Destroyer",
    req: 4,
    power: 18E3,
    armor: 9E3,
    speed: .4,
    storage: 500,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 5E3,
    hp: 22E3
});
ships.push(sss);
civis[2].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "U.N.I.T Zero",
    type: "Servant Ship",
    req: 4,
    power: 1800,
    armor: 200,
    speed: 3.5,
    storage: 50,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 300,
    hp: 500
});
ships.push(sss);
civis[6].ships.push(sss);
sss = new Ship({
    weapon: "laser",
    name: "U.N.I.T Reppu",
    type: "Servant Ship",
    req: 4,
    power: 4E3,
    armor: 800,
    speed: 1.8,
    storage: 50,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 700,
    hp: 2200
});
ships.push(sss);
civis[6].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Glissard",
    type: "Destroyer",
    req: 4,
    power: 18E3,
    armor: 5800,
    speed: 1.2,
    storage: 50,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 7E3,
    hp: 6E3
});
ships.push(sss);
civis[8].ships.push(sss);
sss = new Ship({
    weapon: "ballistic",
    name: "Nabonidus",
    type: "Destroyer",
    req: 4,
    power: 12E3,
    armor: 9200,
    speed: .8,
    storage: 50,
    cost: {
        steel: 2E5,
        titanium: 1E4,
        plastic: 500
    },
    fuel: "uranium",
    weight: 8E3,
    hp: 1E4
});
ships.push(sss);
civis[8].ships.push(sss);
sss = new Ship({
    weapon: "unarmed",
    icon: "heaven",
    name: "The Heaven's Door",
    req: 12,
    type: "Colonial Ship",
    novalue: 1,
    power: 0,
    armor: 1,
    speed: 1.5,
    storage: 2 * mi,
    cost: {
        nanotubes: 25E3,
        robots: 250
    },
    fuel: "fuel",
    weight: 2,
    hp: 1
});
ships.push(sss);
civis[0].ships.push(sss);
sss = new Ship({
    weapon: "antimatter",
    name: "Koroleva",
    type: "Capital Ship",
    resReq: {
        quantum: 3
    },
    req: 99,
    shields: mi,
    power: 300 * mi,
    armor: 50 * mi,
    speed: .035,
    storage: 100 * mi,
    fuel: "hydrogen",
    weight: 5 * mi,
    hp: 5 * bi,
    cost: {
        iron: 200 * bi,
        steel: 2 * tri,
        titanium: 50 * bi,
        nanotubes: 500 * mi,
        ammunition: bi,
        "full battery": 350 * mi,
        "u-ammunition": 100 * mi,
        armor: 10 * mi,
        robots: mi,
        engine: 3E5,
        antimatter: 1E4
    },
    special: {
        desc: "<span style='float:left;margin-left:16px;' class='red_text'>The Anger of Perseus will enter a</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>'berserk mode' when the player's OR</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>the enemy fleet's HP drop below 15%.</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>In this mode, your fleet will get +50%</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>piercing power and will do 50% more</span><span></span><br><span style='float:left;margin-left:16px;' class='red_text'>damage for each Anger of Perseus</span><br>"
    }
});
civis[0].ships.push(sss);
ships.push(sss);
for (s = 0; s < ships.length; s++)
    for (r = 0; r < resNum; r++) 0 < ships[s].cost[r] && (resources[r].ship = !0);
for (i = 0; i < 256 - ships[i].length; i++) ships.push(new Ship("placeholder", "starship", 0, 0, 0, 0, 1E4, !0));
var shipTypes = {};
for (i = 0; i < ships.length; i++) ships[i].id = i;
var typeCount = 0;
for (i = 0; i < ships.length; i++) shipTypes[ships[i].type] ? shipTypes[ships[i].type].push(ships[i].id) : (shipTypes[ships[i].type] = [], shipTypes[ships[i].type].push(ships[i].id), typeCount++);

function ramp(b) {
    return 0 < b ? b : 0
}

function printShips() {
    for (var b = 0; b < ships.length; b++) console.log(b + " - " + ships[b].name)
}

function Fleet(b, e) {
    this.type = "normal";
    this.name = e || "";
    this.civis = b;
    this.ships = [];
    for (var d = 0; d < ships.length; d++) this.ships[d] = 0;
    this.storage = [];
    for (d = 0; d < resNum; d++) this.storage[d] = 0;
    this.autoMap = [];
    this.autoRes = [];
    this.autoPct = [];
    for (var h = 0; 2 > h; h++)
        for (this.autoRes[h] = [], d = 0; d < resNum; d++) this.autoRes[h][d] = 0, this.autoPct[d] = !1;
    this.bestCluster = function () {
        for (var b = 0, d = new Fleet(this.civis, ""), e = 0, h = 0; h < ships.length; h++) this.ships[h] && (this.ships[h] * ships[h].maxStorage * ships[h].speed > this.ships[e] *
            ships[e].maxStorage * ships[e].speed && (e = h), b++);
        if (0 == b) return null;
        d.ships[e] = this.ships[e];
        this.ships[e] = 0;
        d.onlyS = e;
        return d
    };
    this.originalStrength = 1;
    this.totalTime = this.source = this.route = this.origin = this.nextPlanet = this.lastPlanet = this.hop = this.destination = this.departureTime = this.arrivalTime = 0;
    this.type = "orbit";
    this.exp = 0;
    this.speed = function () {
        for (var b = 1E7, d = 0; d < this.ships.length; d++) 0 < this.ships[d] && ships[d].speed < b && (b = ships[d].speed);
        b *= 1 + this.storage[resourcesName.engine.id] / 1E3 * 2E-4;
        b = Math.min(b,
            100);
        0 == this.shipNum() && (b = 0);
        return b
    };
    this.travelSpeed = function () {
        for (var b = 1E7, d = 0; d < this.ships.length; d++) 0 < this.ships[d] && ships[d].travelSpeed < b && (b = ships[d].travelSpeed);
        b *= 1 + this.storage[resourcesName.engine.id] / 1E3 * 2E-4;
        b = Math.min(b, 100);
        0 == this.shipNum() && (b = 0);
        return b
    };
    this.fusion = function (b) {
        for (var d = 0; d < ships.length; d++) this.ships[d] += b.ships[d], b.ships[d] = 0;
        for (d = 0; d < resNum; d++) this.storage[d] += b.storage[d], b.storage[d] = 0;
        this.addExp(b.exp)
    };
    this.addExp = function (b) {
        this.exp = Math.min(this.exp +
            b, MAX_FLEET_EXPERIENCE)
    };
    this.fleetType = function () {
        for (var b = 0, d = 0; d < ships.length; d++) 0 < this.ships[d] && ships[d].weight * this.ships[d] > ships[b].weight * this.ships[b] && (b = d);
        return "Colonial Ship" == ships[b].type ? "Colonial Fleet" : "Miner Ship" == ships[b].type ? "Miner Fleet" : "Cargoship" == ships[b].type ? "Cargo Fleet" : 1 == this.shipNum() && 2 <= this.speed() ? "Scout Fleet" : "War Fleet"
    };
    this.usedStorage = function () {
        for (var b = 0, d = 0; d < resNum; d++) b += this.storage[d];
        return b
    };
    this.availableStorage = function () {
        return this.maxStorage() -
            this.usedStorage()
    };
    this.load = function (b, d) {
        return !(0 > d) && d <= this.availableStorage() ? (this.storage[b] += d, !0) : !1
    };
    this.unloadDelivery = function (b) {
        for (var d = 0; d < resNum; d++) planets[b].resources[d] += this.storage[d], this.storage[d] = 0
    };
    this.unload = function (b) {
        for (var d = 0; d < resNum; d++) planets[b].resourcesAdd(d, this.storage[d]), this.storage[d] = 0
    };
    this.unloadAuto = function (b, d, e) {
        for (var g = 0; g < resNum; g++) planets[d].resources[g] += this.storage[g] * e, planets[b].resourcesAdd(g, -this.storage[g] * (e - 1)), this.storage[g] =
            0
    };
    this.unloadSingle = function (b, d) {
        return !(0 > d) && d <= this.storage[b] ? (this.storage[b] -= d, !0) : !1
    };
    this.maxStorage = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += ships[d].maxStorage * this.ships[d];
        return b
    };
    this.shipNum = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += this.ships[d];
        return b
    };
    this.expBonus = function (b) {
        return {
            power: 1 + 5E-4 * this.exp,
            hp: 1 + 5E-4 * this.exp,
            armor: 1 + 5E-4 * this.exp,
            shield: 1 + 5E-4 * this.exp
        }[b]
    };
    this.power = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += ships[d].power * this.ships[d];
        b *= (1 + 10 * Math.log(1 + this.storage[resourcesName.ammunition.id] / (10 * mi)) / Math.log(2) + 20 * Math.log(1 + this.storage[resourcesName["u-ammunition"].id] / (10 * mi)) / Math.log(2) + 60 * Math.log(1 + this.storage[resourcesName["t-ammunition"].id] / (20 * mi)) / Math.log(2)) * (1 + .1 * Math.log(1 + this.ships[14]) / Math.log(2));
        return b * this.expBonus("power")
    };
    this.armor = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += ships[d].armor * this.ships[d];
        b *= 1 + this.storage[resourcesName.armor.id] / 1E3 * 5E-4;
        return b * this.expBonus("armor")
    };
    this.hp =
        function () {
            for (var b = 0, d = 0; d < ships.length; d++) b += ships[d].hp * this.ships[d];
            return b * this.expBonus("hp")
        };
    this.rawValue = function () {
        for (var b = 0, d = 0, e = 0; e < ships.length; e++) 0 < this.ships[e] && d++;
        if (0 < d)
            for (e = 0; e < ships.length; e++) d = 1 / (ships[e].speed * (1 + this.storage[resourcesName.engine.id] / (5 * mi))) * 4.6 / Math.log(1500) - 2, d = .5 * (1.1 - 2 * d / (1 + Math.abs(2 * d)) * .9), 0 < this.ships[e] && (b += d * this.ships[e] * ships[e].power * this.expBonus("power") * this.ships[e] * ships[e].hp * this.expBonus("hp") / (1.001 - ships[e].armorReduction(this.storage[resourcesName.armor.id])) *
                ships[e].valueMult);
        return b
    };
    this.value = function () {
        var b = this.rawValue();
        b = 100 * (Math.log(1 + b / 1) + Math.log(1 + (10 * Math.log(1 + this.storage[resourcesName.ammunition.id] / 1E7) / Math.log(2) + 20 * Math.log(1 + this.storage[resourcesName["u-ammunition"].id] / 1E7) / Math.log(2) + 60 * Math.log(1 + this.storage[resourcesName["t-ammunition"].id] / 2E7) / Math.log(2)) / 1) + Math.log(1 + .1 * Math.log(1 + this.ships[14]) / Math.log(2) / 1)) / Math.log(1.1);
        return 0 == b ? 1 : b
    };
    this.weight = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += ships[d].weight *
            this.ships[d];
        return b
    };
    this.combatWeight = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += ships[d].combatWeight * this.ships[d];
        return b
    };
    this.totalWeight = function () {
        return this.weight() + this.usedStorage()
    };
    this.battleProb = function (b) {
        var d = ramp(b.hp() / (this.power() - b.armor() - .01));
        b = ramp(this.hp() / (1.1 * b.power() - this.armor() - .01));
        d /= b + .01;
        return Math.random() < d * d / 4 ? 1 : 0
    };
    this.battle = function (b, d) {
        var e = "<span style='font-size:90%;'>",
            h = this,
            g = b;
        this.civis == game.id && (h = b, g = this);
        var l = g.value(),
            E =
            h.value(),
            F = !1;
        d && (F = !0);
        var z = 0,
            v = b.hp(),
            y = this.hp(),
            H = b.hp(),
            A = this.hp();
        var I = [];
        for (var B = [], n = 0; n < ships.length; n++) B[n] = b.ships[n], I[n] = 0 < ships[n].hp ? b.ships[n] * ships[n].hp * b.expBonus("hp") : 0;
        var G = [],
            ba = [];
        for (n = 0; n < ships.length; n++) ba[n] = this.ships[n], G[n] = 0 < ships[n].hp ? this.ships[n] * ships[n].hp * this.expBonus("hp") : 0;
        for (var S = Array(this.ships.length), ca = 0; ca < this.ships.length; ca++) S[n] = 0;
        var M = Array(ships.length);
        for (n = 0; n < ships.length; n++) M[n] = 0;
        var U = Array(ships.length);
        for (n = 0; n < ships.length; n++) U[n] =
            0;
        b.maxStorage();
        this.maxStorage();
        ca = b.usedStorage();
        var ja = this.usedStorage(),
            fa = [],
            ka = [],
            la = [],
            ha = [];
        for (n = 0; n < ships.length; n++) la[n] = this.ships[n], ha[n] = b.ships[n], fa[n] = this.ships[n], ka[n] = b.ships[n];
        for (var D = !1, ia = !1; 0 < v && 0 < y && 256 > z;) {
            var da = "",
                Y = 20;
            for (n = v = 0; n < ships.length; n++) 0 < I[n] && v++;
            for (n = 0; n < ships.length; n++);
            for (n = 0; n < ships.length; n++)
                if (0 < I[n]) {
                    v = b.ships[n] * ships[n].combatWeight / b.combatWeight();
                    var W = 0,
                        Z = 0,
                        P = v * (1 + .1 * Math.log(1 + this.ships[14]) / Math.log(2)),
                        R = 10 * Math.log(1 + this.storage[resourcesName.ammunition.id] /
                            1E7) / Math.log(2) + 20 * Math.log(1 + this.storage[resourcesName["u-ammunition"].id] / 1E7) / Math.log(2) + 60 * Math.log(1 + this.storage[resourcesName["t-ammunition"].id] / 2E7) / Math.log(2),
                        O = {
                            power: b.expBonus("power"),
                            armor: b.expBonus("armor"),
                            hp: b.expBonus("hp"),
                            shield: b.expBonus("shield")
                        },
                        ea = {
                            power: this.expBonus("power"),
                            armor: this.expBonus("armor"),
                            hp: this.expBonus("hp"),
                            shield: this.expBonus("shield")
                        },
                        u = 1 / (1 + Math.log(1 + ships[n].armor * O.armor * (1 + b.storage[resourcesName.armor.id] / (2 * mi)) / 1E4) / Math.log(2)),
                        N = 0,
                        aa = 1;
                    ia && (N = .5, aa = 1 + .5 * this.ships[72]);
                    for (y = 0; y < ships.length; y++) {
                        var Q = ships[n].speed * (1 + b.storage[resourcesName.engine.id] / (5 * mi)) / (ships[y].speed * (1 + this.storage[resourcesName.engine.id] / (5 * mi))) * 4.6 / Math.log(ships[n].combatWeight) - 2;
                        Q = 2 * Q / (1 + Math.abs(2 * Q));
                        Z += .5 * M[y] * (1.1 - .9 * Q) * Math.min(u + N + ships[y].piercing / 100, 1) * aa;
                        var J = M[y] + this.ships[y] * Math.max(ships[y].power * ea.power - ships[n].shield * O.shield, 0) * (1 + R) * P * aa;
                        M[y] += this.ships[y] * ships[y].power * ea.power * (1 + R) * P * aa;
                        W += .5 * J * (1.1 - .9 * Q) * Math.min(u +
                            N + ships[y].piercing / 100, 1) * aa
                    }
                    I[n] -= W;
                    for (y = 0; y < ships.length; y++) M[y] = 0 > I[n] ? -I[n] / (1 + W) * M[y] : 0;
                    da += "Attacker <span class='blue_text' style='font-size:100%'>" + ships[n].name + "</span> suffer <span class='blue_text' style='font-size:100%'>" + beauty(W) + "</span> damage, " + beauty(Z) + " from previous cluster, <span class='blue_text' style='font-size:100%'>" + Math.floor(1E4 * v) / 100 + "%</span> weight<br>";
                    Y += 24
                }
            da += "<br>";
            Y += 24;
            for (n = v = 0; n < ships.length; n++) 0 < G[n] && v++;
            for (n = 0; n < ships.length; n++);
            for (n = 0; n < ships.length; n++)
                if (0 <
                    G[n]) {
                    v = this.ships[n] * ships[n].combatWeight / this.combatWeight();
                    Z = W = 0;
                    P = v * (1 + .1 * Math.log(1 + b.ships[14]) / Math.log(2));
                    R = 10 * Math.log(1 + b.storage[resourcesName.ammunition.id] / 1E7) / Math.log(2) + 20 * Math.log(1 + b.storage[resourcesName["u-ammunition"].id] / 1E7) / Math.log(2) + 60 * Math.log(1 + b.storage[resourcesName["t-ammunition"].id] / 2E7) / Math.log(2);
                    ea = {
                        power: b.expBonus("power"),
                        armor: b.expBonus("armor"),
                        hp: b.expBonus("hp"),
                        shield: b.expBonus("shield")
                    };
                    O = {
                        power: this.expBonus("power"),
                        armor: this.expBonus("armor"),
                        hp: this.expBonus("hp"),
                        shield: this.expBonus("shield")
                    };
                    u = 1 / (1 + Math.log(1 + ships[n].armor * O.armor * (1 + this.storage[resourcesName.armor.id] / (2 * mi)) / 1E4) / Math.log(2));
                    N = 0;
                    aa = 1;
                    D && (N = .5, aa = 1 + .5 * b.ships[72]);
                    for (y = 0; y < ships.length; y++) Q = ships[n].speed * (1 + this.storage[resourcesName.engine.id] / (5 * mi)) / (ships[y].speed * (1 + b.storage[resourcesName.engine.id] / (5 * mi))) * 4.6 / Math.log(ships[n].combatWeight) - 2, Q = 2 * Q / (1 + Math.abs(2 * Q)), Z += .5 * U[y] * (1.1 - .9 * Q) * Math.min(u + N + ships[y].piercing / 100, 1) * aa, J = U[y] + b.ships[y] * Math.max(ships[y].power *
                        ea.power - ships[n].shield * O.shield, 0) * (1 + R) * P * aa, U[y] += b.ships[y] * ships[y].power * ea.power * (1 + R) * P * aa, W += .5 * J * (1.1 - .9 * Q) * Math.min(u + N + ships[y].piercing / 100, 1) * aa;
                    G[n] -= W;
                    for (y = 0; y < ships.length; y++) U[y] = 0 > G[n] ? -G[n] / (1 + W) * U[y] : 0;
                    da += "Defender <span class='blue_text' style='font-size:100%'>" + ships[n].name + "</span> suffer <span class='blue_text' style='font-size:100%'>" + beauty(W) + "</span> damage, " + beauty(Z) + " from previous cluster, <span class='blue_text' style='font-size:100%'>" + Math.floor(1E4 * v) / 100 +
                        "%</span> weight<br>";
                    Y += 24
                }
            da += "<br>";
            da += "<br>";
            Y += 24;
            Y += 24;
            Z = "";
            for (n = 0; n < ships.length; n++) b.ships[n] = 0 < I[n] ? parseInt(Math.ceil(I[n] / (ships[n].hp * b.expBonus("hp")))) : 0, 0 < b.ships[n] && (Z += "Attacker <span class='blue_text' style='font-size:100%'>" + ships[n].name + "</span> remains <span class='blue_text' style='font-size:100%'>" + b.ships[n] + " </span>(-" + Math.floor(1E4 * (1 - b.ships[n] / ka[n])) / 100 + "% of previous round, -" + Math.floor(1E4 * (1 - b.ships[n] / ha[n])) / 100 + "% of total)<br>", Y += 24), ka[n] = b.ships[n];
            Y += 24;
            W = "";
            for (n = 0; n < ships.length; n++) this.ships[n] = 0 < G[n] ? parseInt(Math.ceil(G[n] / (ships[n].hp * this.expBonus("hp")))) : 0, 0 < this.ships[n] && (W += "Defender <span class='blue_text' style='font-size:100%'>" + ships[n].name + "</span> remains <span class='blue_text' style='font-size:100%'>" + this.ships[n] + "</span> (-" + Math.floor(1E4 * (1 - this.ships[n] / fa[n])) / 100 + "% of previous round, -" + Math.floor(1E4 * (1 - this.ships[n] / la[n])) / 100 + "% of total)<br>", Y += 24), fa[n] = this.ships[n];
            v = b.hp();
            y = this.hp();
            gameSettings.hpreport &&
                (Z = "<span class='blue_text' style='font-size:100%'>HP left (%): " + Math.floor(v / H * 1E4) / 100 + "</span><br>" + Z, W = "<span class='blue_text' style='font-size:100%'>HP left (%): " + Math.floor(y / A * 1E4) / 100 + "</span><br>" + W);
            (.15 >= v / H || .15 >= y / A) && 0 < b.ships[72] && (D = !0, Z = "<span class='red_text' style='font-size:100%'>Attacker is in berserk!</span><br>" + Z);
            (.15 >= y / A || .15 >= v / H) && 0 < this.ships[72] && (ia = !0, W = "<span class='red_text' style='font-size:100%'>Defender is in berserk!</span><br>" + W);
            da += Z + "<br>" + W;
            z++;
            F || b.addExp(1);
            e += "<li id='turn" + z + "' name='" + z + "' class='button' style='height:" + Y + "px;'><span class='blue_text' style='font-size:120%;'>BATTLE TURN " + z + "</span><br><br><span class='white_text'>" + da + "</span></li>"
        }
        I = 0;
        n = civis[h.civis].influence() / game.influence();
        if (1 > n && g.power() > 2 * h.power() && g.armor() > 2 * h.armor() && g.hp() > 2 * h.hp() && (n = Math.min(1 - n, .3), Math.random() < n)) {
            I = n / 3;
            G = !1;
            for (n = 0; n < ships.length; n++) S[n] = Math.floor(I * h.ships[n]), 0 < S[n] && (G = !0);
            G ? console.log("captured something") : I = 0
        }
        Y = 20;
        da = "";
        if (0 < I)
            for (n =
                0; n < ships.length; n++) S[n] = Math.floor(I * h.ships[n]), 0 < S[n] && (da += "<span class='blue_text' style='font-size:100%'>" + ships[n].name + "</span> captured: <span class='blue_text' style='font-size:100%'>" + S[n] + "</span><br>", Y += 20);
        20 < Y && (e += "<li id='turnCAPTURE' name='capture' class='button' style='height:120px;'><span class='blue_text' style='font-size:120%;'>Your Fleet captured " + Math.floor(100 * I) / 100 + "% of enemy ships: </span><br><br><span class='white_text'>" + da + "</span></li>");
        G = !1;
        0 < b.shipNum() && 0 < this.shipNum() &&
            (G = !0);
        if (F)
            for (n = 0; n < ships.length; n++) b.ships[n] = B[n], this.ships[n] = ba[n];
        else {
            this.storage[resourcesName.ammunition.id] = 0;
            this.storage[resourcesName["u-ammunition"].id] = 0;
            this.storage[resourcesName["t-ammunition"].id] = 0;
            this.storage[resourcesName.armor.id] *= .5;
            b.storage[resourcesName.ammunition.id] = 0;
            b.storage[resourcesName["u-ammunition"].id] = 0;
            b.storage[resourcesName["t-ammunition"].id] = 0;
            b.storage[resourcesName.armor.id] *= .5;
            B = this.maxStorage() / ja;
            ba = b.maxStorage() / ca;
            for (ca = 0; ca < resNum; ca++) 1 >
                B && (this.storage[ca] = Math.floor(this.storage[ca] * B)), 1 > ba && (b.storage[ca] = Math.floor(b.storage[ca] * ba));
            if (0 < I)
                for (n = 0; n < ships.length; n++) h.ships[n] -= S[n], g.ships[n] += S[n]
        }
        h = 0;
        H = 1 == z && 0 >= v && 0 >= y ? b.speed() >= this.speed() ? "atk" : "def" : v / H >= y / A ? "atk" : "def";
        F || G || ("def" == H ? b.exp = Math.floor(b.exp / 2) : .9 < l / (E + 1) && (h = Math.ceil(this.exp / 2), b.addExp(h), this.exp = Math.floor(this.exp / 2)));
        l = "def" == H ? this : b;
        G ? (e += "<li id='turnEND' name='battle_end' class='button' style='height:120px;'><span class='white_text'>The battle resulted in a draw!</span><br><span class='white_text'>Awarded </span><span class='blue_text' style=''>" +
            beauty(h) + "</span><span class='white_text'> experience points</span></li>", H = "draw") : e += "<li id='turnEND' name='battle_end' class='button' style='height:120px;'><span class='white_text'>The fleet </span><span class='blue_text' style=''>" + l.name + "</span><span class='white_text'> won the battle.</span><br><span class='white_text'>Awarded </span><span class='blue_text' style=''>" + beauty(z + h) + "</span><span class='white_text'> experience points</span></li>";
        return {
            winner: H,
            r: e + "</span>"
        }
    };
    this.move = function (b,
        d) {
        return fleetSchedule.push(this, b, b, d, this.type)
    };
    this.shipNum = function () {
        for (var b = 0, d = 0; d < ships.length; d++) b += this.ships[d];
        return b
    }
}
for (i = 0; i < planets.length; i++) planets[i].fleets[0] = new Fleet(planets[i].civis, "shp"), planets[i].fleets.hub = new Fleet(planets[i].civis, "hub");
var mf = new Fleet(1, "The Keeper");
mf.ships[3] = 100;
mf.ships[4] = 50;
mf.ships[5] = 35;
mf.ships[8] = 10;
mf.ships[15] = 3;
mf.ships[16] = 1;
mf.exp = 6;
planets[planetsName.mexager].fleetPush(mf);
mf = new Fleet(2, "Phantids Defence Fleet");
mf.ships[25] = 1;
mf.exp = 12;
planets[planetsName.traumland].fleetPush(mf);
mf = new Fleet(3, "Thlipsi Fleet");
mf.ships[47] = 8E3;
mf.ships[51] = 1;
planets[planetsName.tsartasis].fleetPush(mf);
mf = new Fleet(3, "Monaxia Fleet");
mf.ships[47] = 8E4;
mf.ships[51] = 1;
mf.exp = 80;
planets[planetsName.mermorra].fleetPush(mf);
mf = new Fleet(3, "Erimosi Fleet");
mf.ships[47] = 8E4;
mf.ships[48] = 1E3;
mf.ships[51] = 1;
planets[planetsName.echoes].fleetPush(mf);
mf = new Fleet(3, "Katastrofis Fleet");
mf.ships[47] = 8E4;
mf.ships[48] = 2E3;
mf.ships[51] = 1;
planets[planetsName.kitrino].fleetPush(mf);
mf = new Fleet(3, "Loimos Fleet");
mf.ships[47] = 3E5;
mf.ships[48] = 2E3;
mf.ships[51] = 10;
planets[planetsName.kandi].fleetPush(mf);
mf = new Fleet(3, "Polemos Fleet");
mf.ships[47] = 8E5;
mf.ships[48] = 5E3;
mf.ships[49] = 1E3;
mf.ships[51] = 20;
mf.exp = 80;
planets[planetsName.ares].fleetPush(mf);
mf = new Fleet(3, "Thanatos Fleet");
mf.ships[47] = 3E6;
mf.ships[48] = 8E3;
mf.ships[49] = 5E3;
mf.ships[50] = 1E3;
mf.ships[51] = 25;
mf.exp = 100;
planets[planetsName.xora2].fleetPush(mf);
mf = new Fleet(3, "Anastasi Fleet");
mf.ships[47] = 1E7;
mf.ships[48] = 15E3;
mf.ships[49] = 8E3;
mf.ships[50] = 2E3;
mf.ships[51] = 50;
mf.ships[52] = 1;
mf.exp = 150;
planets[planetsName.xora].fleetPush(mf);
mf = new Fleet(4, "Posirion Defence Fleet");
mf.ships[41] = 750;
mf.ships[46] = 15;
planets[planetsName.posirion].fleetPush(mf);
mf = new Fleet(4, "Traurig Defence Fleet");
mf.ships[41] = 3E3;
mf.ships[46] = 60;
planets[planetsName.traurig].fleetPush(mf);
mf = new Fleet(4, "Diplomatic Fleet");
mf.ships[41] = 5E3;
mf.ships[42] = 400;
mf.ships[46] = 150;
planets[planetsName.epsilon].fleetPush(mf);
mf = new Fleet(4, "Zhura Defence Fleet");
mf.ships[41] = 1E4;
mf.ships[42] = 1E3;
mf.ships[46] = 250;
mf.ships[43] = 10;
planets[planetsName.zhura].fleetPush(mf);
mf = new Fleet(4, "Juini Shadow");
mf.ships[41] = 2E4;
mf.ships[42] = 2E3;
mf.ships[46] = 500;
mf.ships[45] = 10;
mf.exp = 50;
planets[planetsName.bhara].fleetPush(mf);
mf = new Fleet(4, "Azure Fleet");
mf.ships[41] = 5E4;
mf.ships[42] = 5E3;
mf.ships[46] = 2E3;
mf.ships[44] = 5;
mf.exp = 80;
planets[planetsName.caerul].fleetPush(mf);
mf = new Fleet(5, "Purification Fleet");
mf.ships[33] = 1E3;
mf.ships[34] = 1;
planets[planetsName.miselquris].fleetPush(mf);
mf = new Fleet(5, "Konquista");
mf.ships[33] = 3E3;
mf.ships[35] = 1;
planets[planetsName.kurol].fleetPush(mf);
mf = new Fleet(5, "The Last Stand");
mf.ships[33] = 5E3;
mf.ships[36] = 1;
planets[planetsName.antaris].fleetPush(mf);
mf = new Fleet(5, "Styx Legion");
mf.ships[33] = 1E4;
mf.ships[37] = 1;
mf.ships[38] = 1;
mf.exp = 50;
planets[planetsName.teleras].fleetPush(mf);
mf = new Fleet(5, "Hell Warden");
mf.ships[33] = 3E3;
mf.ships[40] = 100;
mf.ships[39] = 1;
mf.exp = 50;
planets[planetsName.jabir].fleetPush(mf);
mf = new Fleet(6, "I.R.C. S.E.A.S. F.L.E.E.T.");
mf.ships[29] = 1;
mf.ships[30] = 1;
mf.ships[31] = 1;
mf.ships[32] = 1;
mf.exp = 22;
planets[planetsName.zelera].fleetPush(mf);
mf = new Fleet(7, "The Ugly");
mf.ships[20] = 30;
mf.ships[23] = 1;
planets[planetsName.uanass].fleetPush(mf);
mf = new Fleet(7, "The Bad");
mf.ships[19] = 150;
mf.ships[22] = 1;
planets[planetsName.uanass].fleetPush(mf);
mf = new Fleet(7, "The Good");
mf.ships[20] = 50;
mf.ships[21] = 1;
planets[planetsName.uanass].fleetPush(mf);
mf = new Fleet(7, "Silver Fleet");
mf.ships[17] = 1;
planets[planetsName.nassaus].fleetPush(mf);
mf = new Fleet(8, "O.L. Defence Fleet");
mf.ships[24] = 1;
planets[planetsName.santorini].fleetPush(mf);
mf = new Fleet(8, "Babilo Protector");
mf.ships[18] = 1;
mf.exp = 100;
planets[planetsName.virgo].fleetPush(mf);
mf = new Fleet(9, "Vernichtung");
mf.ships[26] = 1;
mf.ships[27] = 35;
mf.ships[28] = 500;
mf.exp = 18;
planets[planetsName.lagea].fleetPush(mf);
mf = new Fleet(10, "Abiha");
mf.ships[55] = 1E7;
mf.ships[60] = 1;
planets[planetsName.conquest].fleetPush(mf);
mf = new Fleet(10, "Deborha");
mf.ships[55] = 35E6;
mf.ships[58] = 1;
planets[planetsName.kartarid].fleetPush(mf);
mf = new Fleet(10, "Jerusha");
mf.ships[55] = 5E7;
mf.ships[56] = 1E6;
mf.ships[57] = 1;
planets[planetsName.cerberus].fleetPush(mf);
mf = new Fleet(10, "Juditha");
mf.ships[55] = 5E7;
mf.ships[56] = 25E5;
mf.ships[59] = 1;
mf.exp = 200;
planets[planetsName.death].fleetPush(mf);
mf = new Fleet(11, "Arjini Lisis Fleet");
mf.ships[46] = 10 * mi;
mf.ships[61] = 1;
planets[planetsName.yanyin].fleetPush(mf);
mf = new Fleet(11, "Aurin Firmis Fleet");
mf.ships[46] = 30 * mi;
mf.ships[43] = mi;
mf.ships[62] = 1;
planets[planetsName.siris].fleetPush(mf);
mf = new Fleet(11, "Rubian Passis Fleet");
mf.ships[46] = 100 * mi;
mf.ships[43] = 3 * mi;
mf.ships[44] = mi;
mf.ships[63] = 1;
planets[planetsName.xilea].fleetPush(mf);
mf = new Fleet(11, "Safir Voluptua Fleet");
mf.ships[46] = 300 * mi;
mf.ships[43] = 10 * mi;
mf.ships[44] = 3 * mi;
mf.ships[64] = 1;
mf.exp = 300;
planets[planetsName.asun].fleetPush(mf);
mf = new Fleet(12, "Esperanza Fleet");
mf.ships[65] = 10 * mi;
mf.ships[67] = 10;
planets[planetsName.swamp].fleetPush(mf);
mf = new Fleet(12, "Antilla Fleet");
mf.ships[65] = 50 * mi;
mf.ships[66] = mi;
mf.ships[68] = 10;
planets[planetsName.columbus].fleetPush(mf);
mf = new Fleet(12, "Molucca Fleet");
mf.ships[65] = 100 * mi;
mf.ships[66] = 3 * mi;
mf.ships[69] = 5;
planets[planetsName.magellan].fleetPush(mf);
mf = new Fleet(12, "Australis Fleet");
mf.ships[65] = 120 * mi;
mf.ships[66] = 5 * mi;
mf.ships[67] = 25;
mf.ships[69] = 10;
planets[planetsName.gerlache].fleetPush(mf);
mf = new Fleet(12, "Astris Fleet");
mf.ships[65] = 150 * mi;
mf.ships[66] = 10 * mi;
mf.ships[67] = 50;
mf.ships[68] = 20;
mf.ships[69] = 15;
mf.exp = 800;
planets[planetsName.gagarin].fleetPush(mf);
mf = new Fleet(13, "Canchrena Uxor");
mf.ships[74] = mi;
mf.ships[75] = 35E4;
planets[planetsName.alfari].fleetPush(mf);
mf = new Fleet(13, "Purulis Uxor");
mf.ships[74] = mi;
mf.ships[76] = mi;
planets[planetsName.alfari].fleetPush(mf);
mf = new Fleet(13, "Alfari Uxor");
mf.ships[75] = mi;
mf.ships[76] = 25E4;
planets[planetsName.alfari].fleetPush(mf);
mf = new Fleet(13, "Xenopraedo");
mf.ships[74] = 3 * mi;
mf.ships[75] = mi;
mf.ships[77] = 1;
mf.exp = 100;
planets[planetsName.xeno].fleetPush(mf);
mf = new Fleet(13, "Xenoterrent");
mf.ships[75] = mi;
mf.ships[76] = mi;
mf.ships[77] = 2;
mf.exp = 100;
planets[planetsName.xeno].fleetPush(mf);
mf = new Fleet(13, "Flucta Fleet");
mf.ships[74] = bi;
mf.ships[75] = bi;
mf.ships[76] = bi;
mf.ships[77] = 1E3;
mf.ships[78] = 1;
mf.exp = 1E3;
planets[planetsName.caligo].fleetPush(mf);
mf = new Fleet(14, "Mairi's Wisdom");
mf.ships[61] = 3E3;
mf.ships[62] = 1E3;
mf.ships[63] = 300;
mf.ships[64] = 100;
mf.ships[79] = 1;
mf.exp = 200;
planets[planetsName.halea].fleetPush(mf);
mf = new Fleet(14, "Suranis' Strength");
mf.ships[61] = 3E3;
mf.ships[62] = 1E3;
mf.ships[63] = 300;
mf.ships[64] = 100;
mf.ships[80] = 1;
mf.exp = 200;
planets[planetsName.halea].fleetPush(mf);
mf = new Fleet(14, "Juini's Pride");
mf.ships[61] = 3E3;
mf.ships[62] = 1E3;
mf.ships[63] = 300;
mf.ships[64] = 100;
mf.ships[81] = 1;
mf.exp = 200;
planets[planetsName.halea].fleetPush(mf);
mf = new Fleet(15, "Thymos Fleet");
mf.ships[65] = 5E8;
mf.ships[66] = 5E9;
mf.ships[82] = 1;
planets[planetsName.persephone].fleetPush(mf);
mf = new Fleet(15, "Zilia Fleet");
mf.ships[65] = 2E9;
mf.ships[66] = 2E10;
mf.ships[82] = 1;
mf.ships[83] = 1;
planets[planetsName.hades].fleetPush(mf);
mf = new Fleet(15, "Fonos Fleet");
mf.ships[65] = 5E11;
mf.ships[66] = 5E12;
mf.ships[82] = 1;
mf.ships[83] = 1;
mf.ships[84] = 1;
planets[planetsName.demeter].fleetPush(mf);
mf = new Fleet(16, "Formation Y331");
mf.ships[85] = 1;
mf.exp = 80;
planets[planetsName.hermr].fleetPush(mf);
mf = new Fleet(16, "Formation Y184");
mf.ships[85] = 2;
mf.exp = 120;
planets[planetsName.auriga].fleetPush(mf);
mf = new Fleet(16, "Formation Y67");
mf.ships[85] = 5;
mf.ships[86] = 2;
mf.exp = 200;
planets[planetsName.calipsi].fleetPush(mf);
mf = new Fleet(16, "Formation Y22");
mf.ships[85] = 5;
mf.ships[86] = 2;
mf.ships[87] = 1;
mf.exp = 500;
planets[planetsName.forax].fleetPush(mf);
mf = new Fleet(16, "Formation Y06");
mf.ships[85] = 100;
mf.ships[86] = 20;
mf.ships[87] = 1;
mf.exp = 800;
planets[planetsName.cygnus].fleetPush(mf);
mf = new Fleet(16, "Formation Y01");
mf.ships[85] = 25;
mf.ships[86] = 10;
mf.ships[87] = 5;
mf.ships[88] = 1;
mf.exp = 1200;
planets[planetsName.volor].fleetPush(mf);
for (i = 0; i < planets.length; i++) {
    var plt = planets[i];
    if (plt.civis)
        for (var f in plt.fleets) "hub" != f && 0 != f && (plt.fleets[f].originalStrength = plt.fleets[f].rawValue())
}

function FleetSchedule() {
    this.fleets = [];
    this.list = null;
    this.activeNum = this.count = 0;
    this.fleetArrived = !1;
    this.pop = function () {
        for (var b = [], e = [], d = 0; d < this.fleets.length; d++) {
            var h = idleBon;
            if (this.fleets[d] && this.fleets[d].departureTime + (this.fleets[d].arrivalTime - this.fleets[d].departureTime) / h <= (new Date).getTime())
                if (this.list = this.fleets[d], 0 == this.fleets[d].departureTime) b.push({
                    fleet: this.fleets[d],
                    destination: this.list.destination
                }), this.fleets[d] = null;
                else if (this.list.nextPlanet != this.list.destination) e.push({
                o: this.list.origin,
                t: this.list.type,
                f: this.fleets[d],
                s: this.list.nextPlanet,
                d: this.list.destination,
                id: d,
                hop: this.list.hop + 1
            });
            else if ("auto" == this.fleets[d].type) {
                e.push({
                    o: this.list.destination,
                    t: "auto",
                    f: this.fleets[d],
                    s: this.list.destination,
                    d: this.list.origin,
                    id: d,
                    hop: 0
                });
                h = this.list.destination;
                var g = this.fleets[d];
                g.unload(h);
                if (g.autoRes[g.autoMap[h]])
                    for (var l = 0; l < resNum; l++) {
                        var m = g.autoRes[g.autoMap[h]][l],
                            t = parseInt(Math.floor(2 * planets[this.list.origin].shortestPath[h].distance / g.speed()));
                        g.autoPct[l] &&
                            (m = 0, 0 > planets[this.list.origin].globalRaw[l] && (m -= planets[this.list.origin].globalRaw[l] * g.autoRes[g.autoMap[this.list.origin]][l] / 1E4 * t / idleBon), 0 < planets[h].globalRaw[l] && (m += planets[h].globalRaw[l] * g.autoRes[g.autoMap[h]][l] / 1E4 * t / idleBon));
                        m = Math.min(Math.min(Math.floor(m), planets[h].resources[l]), g.availableStorage());
                        g.load(l, m) && planets[h].resourcesAdd(l, -m)
                    } else b.push({
                        fleet: this.fleets[d],
                        destination: this.list.destination
                    }), this.fleets[d] = null
            } else if ("market_sell" == this.fleets[d].type) market.sell(this.fleets[d]),
                e.push({
                    o: this.list.destination,
                    t: "normal",
                    f: this.fleets[d],
                    s: this.list.destination,
                    d: this.list.origin,
                    id: d,
                    hop: 0
                }), this.fleets[d].type = "normal";
            else if ("market_delivery" == this.fleets[d].type) this.fleets[d].unload(this.fleets[d].destination), this.fleets[d] = null;
            else if ("delivery" == this.fleets[d].type) this.fleets[d].unload(this.fleets[d].destination), e.push({
                o: this.list.destination,
                t: "normal",
                f: this.fleets[d],
                s: this.list.destination,
                d: this.list.origin,
                id: d,
                hop: 0
            }), this.fleets[d].type = "normal";
            else if ("qd" ==
                this.fleets[d].type) {
                for (h = 0; h < resNum; h++) 0 < this.fleets[d].storage[h] && deliveryCount[this.list.origin][this.list.destination][h]--;
                this.fleets[d].unloadDelivery(this.fleets[d].destination);
                e.push({
                    o: this.list.destination,
                    t: "qn",
                    f: this.fleets[d],
                    s: this.list.destination,
                    d: this.list.origin,
                    id: d,
                    hop: 0
                });
                this.fleets[d].type = "qn"
            } else "qn" == this.fleets[d].type ? (planets[this.list.destination].fleets.hub.fusion(this.fleets[d]), this.fleets[d] = null) : "enemy_raid" != this.fleets[d].type && (b.push({
                fleet: this.fleets[d],
                destination: this.list.destination
            }), this.fleets[d] = null)
        }
        for (d = 0; d < e.length; d++) this.push2(e[d].f, e[d].s, e[d].o, e[d].d, e[d].t, e[d].id);
        0 < e.length && "travelingShipInterface" == currentInterface && mainCycle >= fpsFleet / fps && exportTravelingShipInterface(currentCriteriaAuto);
        return b
    };
    this.push = function (b, e, d, h, g) {
        if (e != h && planets[e].shortestPath[h]) {
            for (var l = 0; this.fleets[l];) l++;
            this.fleets[l] = b;
            var m = planets[e].shortestPath[h].route,
                t = planets[e].shortestPath[h].distance,
                x = routes[m].distance();
            b = b.speed();
            var C = (new Date).getTime();
            x = C + x / b * 1E3;
            for (var E = C + t / b * 1E3, F = shortestRouteId(d, h), z = 0, v = 1; v < F.length && F[v] != e;) z++, v++;
            this.fleets[l].route = m;
            this.fleets[l].totalTime = E;
            this.fleets[l].departureTime = C;
            this.fleets[l].arrivalTime = x;
            this.fleets[l].origin = d;
            this.fleets[l].source = e;
            this.fleets[l].destination = h;
            this.fleets[l].lastPlanet = e;
            this.fleets[l].nextPlanet = routes[m].other(e);
            this.fleets[l].type = g;
            this.fleets[l].hop = z;
            return t / b
        }
        return -1
    };
    this.push2 = function (b, e, d, h, g, l) {
        if (e != h && planets[e].shortestPath[h]) {
            var m =
                planets[e].shortestPath[h].route,
                t = planets[e].shortestPath[h].distance,
                x = routes[m].distance();
            b = b.speed();
            var C = (new Date).getTime();
            x = C + x / b * 1E3;
            for (var E = C + t / b * 1E3, F = shortestRouteId(d, h), z = 0, v = 1; v < F.length && F[v] != e;) z++, v++;
            this.fleets[l].route = m;
            this.fleets[l].totalTime = E;
            this.fleets[l].departureTime = C;
            this.fleets[l].arrivalTime = x;
            this.fleets[l].origin = d;
            this.fleets[l].source = e;
            this.fleets[l].destination = h;
            this.fleets[l].lastPlanet = e;
            this.fleets[l].nextPlanet = routes[m].other(e);
            this.fleets[l].type =
                g;
            this.fleets[l].hop = z;
            return t / b + 3 * z
        }
        return -1
    };
    this.civisFleetold = function (b) {
        for (var e = [], d = this.list, h = 0; h < this.fleets.length; h++);
        for (; d;) this.fleets[d.fleet].civis == b && e.push({
            fleet: d.fleet,
            route: d.route,
            totalTime: d.totalTime,
            departureTime: d.departureTime,
            arrivalTime: d.arrivalTime,
            source: d.source,
            destination: d.destination,
            next: null,
            origin: d.origin,
            lastPlanet: d.lastPlanet,
            nextPlanet: d.nextPlanet,
            type: d.type,
            hop: d.hop,
            fleet_name: this.fleets[d.fleet].name
        }), d = d.next;
        e.sort(function (b, d) {
            var e = b.fleet_name.toLowerCase(),
                h = d.fleet_name.toLowerCase();
            return e < h ? -1 : e > h ? 1 : 0
        });
        return e
    };
    this.civisFleet = function (b) {
        for (var e = [], d = 0; d < this.fleets.length; d++)
            if (this.fleets[d] && this.fleets[d].civis == b) {
                var h = this.fleets[d];
                e.push({
                    fleet: d,
                    route: h.route,
                    totalTime: h.totalTime,
                    departureTime: h.departureTime,
                    arrivalTime: h.arrivalTime,
                    source: h.source,
                    destination: h.destination,
                    origin: h.origin,
                    lastPlanet: h.lastPlanet,
                    nextPlanet: h.nextPlanet,
                    type: h.type,
                    hop: h.hop,
                    fleet_name: this.fleets[d].name
                })
            }
        e.sort(function (b, d) {
            var e = b.fleet_name.toLowerCase(),
                h = d.fleet_name.toLowerCase();
            return e < h ? -1 : e > h ? 1 : 0
        });
        return e
    };
    this.marketFleets = function () {
        for (var b = [], e = 0; e < this.fleets.length; e++)
            if (this.fleets[e] && ("market_delivery" == this.fleets[e].type || "market_sell" == this.fleets[e].type)) {
                var d = this.fleets[e];
                b.push({
                    fleet: e,
                    route: d.route,
                    totalTime: d.totalTime,
                    departureTime: d.departureTime,
                    arrivalTime: d.arrivalTime,
                    source: d.source,
                    destination: d.destination,
                    origin: d.origin,
                    lastPlanet: d.lastPlanet,
                    nextPlanet: d.nextPlanet,
                    type: d.type,
                    hop: d.hop,
                    fleet_name: this.fleets[e].name
                })
            }
        b.sort(function (b,
            d) {
            var e = b.fleet_name.toLowerCase(),
                h = d.fleet_name.toLowerCase();
            return e < h ? -1 : e > h ? 1 : 0
        });
        return b
    };
    this.toArray = function () {};
    this.load = function (b, e, d) {
        this.fleets = [];
        for (var h = b = 0; h < d; h++) e[h] && (this.fleets[b] = $.extend(!0, new Fleet(e[h].civis, e[h].name), e[h]), b++)
    }
}
var fleetSchedule = new FleetSchedule,
    market = new Market,
    tournamentPlanet = planetsName.teleras,
    qurisTournament = {
        fleet: null,
        points: 0,
        lose: 0,
        rank: function () {
            return Math.log(points) / Math.log(10)
        }
    };

function generateQurisTournamentFleet() {
    for (var b = [], e = 1; e < civis.length; e++) game.researches[researchesName.astronomy].level >= civis[e].hops && 0 < civis[e].planets.length && b.push(e);
    if (0 == b.length) return -333;
    e = 1E16 * Math.pow(1.5, qurisTournament.points);
    var d = b[Math.floor(Math.random() * b.length)];
    if (d = generateFleetSub(d, e, civis[d].name + " Tournament Fleet")) qurisTournament.fleet = d.f;
    var h = 1;
    if (qurisTournament.fleet) return 0;
    for (; null == qurisTournament.fleet;) {
        d = b[Math.floor(Math.random() * b.length)];
        if (d = generateFleetSub(d,
                e, civis[d].name + " Tournament Fleet")) qurisTournament.fleet = d.f;
        h++
    }
    return h
}

function generateFleet(b, e, d) {
    for (var h = null, g = 0; null == h && 100 > g;) {
        var l = generateFleetSub(b, e, d);
        l && l.f && (h = l.f);
        g++
    }
    return h
}

function generateFleetSub(b, e, d) {
    var h = .98 * e;
    e *= 1.01;
    d = new Fleet(b, d);
    for (var g = 1, l = !1, m = 0; m < civis[b].ships.length; m++) {
        var t = civis[b].ships[m].id,
            x = new Fleet(0, "");
        x.ships[t] = 1;
        if (x.rawValue() < h) {
            l = !0;
            break
        }
    }
    if (!l) return null;
    l = [];
    for (m = 0; m < ships.length; m++) l[m] = 11;
    for (; d.rawValue() < h && 1E4 >= g;) m = civis[b].ships[Math.floor(Math.random() * civis[b].ships.length)].id, 0 == d.ships[m] ? (d.ships[m] = 1, t = d.rawValue(), t > e ? d.ships[m] = 0 : t < h && (t = d.ships[m], d.ships[m] = Math.floor(d.ships[m] * (l[m] + 1)), d.rawValue() > e &&
        (d.ships[m] = t, l[m] /= 2))) : (t = d.ships[m], d.ships[m] = Math.floor(d.ships[m] * (l[m] + 1)), d.rawValue() > e && (d.ships[m] = t, l[m] /= 2)), g++;
    return {
        f: d,
        iterations: g
    }
}
var dk = 1,
    mk = 6,
    body1 = {
        pos: {
            x: 180,
            y: 300
        },
        v: {
            x: 400.3,
            y: 0
        },
        a: {
            x: 0,
            y: 0
        },
        mass: 1E-4 * mk
    },
    body2 = {
        pos: {
            x: 180,
            y: 320
        },
        v: {
            x: 0,
            y: 0
        },
        a: {
            x: 0,
            y: 0
        },
        mass: 1E4 * mk
    },
    simT = 0,
    step = .1;

function squaredDistanceBody(b, e) {
    var d = b.pos.x - e.pos.x,
        h = b.pos.y - e.pos.y;
    return d * d + h * h
}

function calculateBody(b, e, d) {
    b.a.x = e * Math.sin(d) / b.mass;
    b.a.y = e * Math.cos(d) / b.mass;
    b.v.x += b.a.x * step;
    b.v.y += b.a.y * step;
    b.pos.x += b.v.x * step;
    b.pos.y += b.v.y * step
}

function twoBody(b, e) {
    var d = b.pos.x - e.pos.x,
        h = b.pos.y - e.pos.y,
        g = Math.atan2(d, h);
    d = b.mass * e.mass / (dk * Math.sqrt(d * d + h * h) + 1E-7);
    calculateBody(b, -d, g);
    calculateBody(e, d, g);
    simT++
}
for (var ranks = [], hkj = 0; hkj < civis.length; hkj++) {
    var researches = [];
    r = new Research({
        id: "mineralogy",
        name: "Geology",
        desc: "var str = \"\";if (this.level <= 3) str += \"<br>Level <span class='blue_text' style='font-size:100%;'>3</span>: Allows <span class='blue_text' style='font-size:100%;'>Metal Collector</span> and <span class='blue_text' style='font-size:100%;'>Sand Quarry</span> construction\"; return str;",
        researchPoint: 125
    });
    r.pos = [3, 0];
    r.buildingBonus = [{
            id: "mine",
            resource: "iron",
            value: 25,
            level: 1
        },
        {
            id: "graphext",
            resource: "graphite",
            value: 12,
            level: 1
        }, {
            id: "submetal",
            resource: "iron",
            value: 12,
            level: 1
        }, {
            id: "submetal",
            resource: "titanium",
            value: 18,
            level: 1
        }, {
            id: "submetal",
            resource: "uranium",
            value: 12,
            level: 1
        }, {
            id: "subsand",
            resource: "sand",
            value: 12,
            level: 1
        }, {
            id: "subsand",
            resource: "graphite",
            value: 12,
            level: 1
        }, {
            id: "lavamine",
            resource: "graphite",
            value: 12,
            level: 1
        }, {
            id: "lavamine2",
            resource: "titanium",
            value: 18,
            level: 1
        }, {
            id: "rhodiumext",
            resource: "titanium",
            value: 18,
            level: 1
        }, {
            id: "collector",
            resource: "titanium",
            value: 18,
            level: 4
        }, {
            id: "collector",
            resource: "uranium",
            value: 12,
            level: 4
        }, {
            id: "quarry",
            resource: "sand",
            value: 12,
            level: 4
        }, {
            id: "sand",
            resource: "sand",
            value: 12,
            level: 4
        }, {
            id: "pumpjack",
            resource: "oil",
            value: 8,
            level: 4
        }, {
            id: "algaefarm",
            resource: "oil",
            value: 8,
            level: 4
        }, {
            id: "biofuel",
            resource: "oil",
            value: 8,
            level: 4
        }];
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    r = new Research({
        id: "material",
        name: "Material Science",
        desc: "var str=\"\"; if (this.level <= 7) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>8</span>: Allows <span class='blue_text' style='font-size:100%;'>Plastic Factory</span> and <span class='blue_text' style='font-size:100%;'>Polymerizer</span> construction\"; if (this.level <= 14) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>15</span>: Allows <span class='blue_text' style='font-size:100%;'>Nanotubes Factory</span> construction\"; return str;",
        researchPoint: 500,
        techPoint: 15,
        multBonus: 1.4
    });
    r.pos = [3, 1];
    r.req = {
        mineralogy: 1
    };
    r.buildingBonus = [{
        id: "foundry",
        resource: "steel",
        value: 50,
        level: 1
    }, {
        id: "plastic",
        resource: "plastic",
        value: 25,
        level: 8
    }, {
        id: "polymer",
        resource: "plastic",
        value: 25,
        level: 8
    }, {
        id: "bioplastic",
        resource: "plastic",
        value: 25,
        level: 8
    }, {
        id: "nanofact",
        resource: "nanotubes",
        value: 12,
        level: 15
    }, {
        id: "nanomarine",
        resource: "nanotubes",
        value: 12,
        level: 15
    }];
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    r = new Research({
        id: "chemical",
        name: "Chemical Engineering",
        desc: "var str=\"\"; if (this.level == 0) str +=\"<br>Allows <span class='blue_text' style='font-size:100%;'>Oil</span> extraction\"; if (this.level <= 1) str +=\"<br>Level<span class='blue_text' style='font-size:100%;'>2</span>: Allows <span class='blue_text' style='font-size:100%;'>Oil Refinery</span> construction\"; return str;",
        researchPoint: 1200,
        techPoint: 12
    });
    r.tier = 1;
    r.pos = [3, 2];
    r.req = {
        material: 1
    };
    r.buildingBonus = [{
        id: "converter",
        resource: "fuel",
        value: 25,
        level: 1
    }, {
        id: "floatharv",
        resource: "methane",
        value: 20,
        level: 1,
        showCondition: function () {
            return game.searchPlanet(planetsName.orpheus)
        }
    }, {
        id: "ref",
        resource: "fuel",
        value: 12,
        level: 3
    }];
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    r = new Research({
        id: "astronomy",
        name: "Interstellar Travel",
        desc: "var str = \"Allows to see planets at <span class='blue_text' style='font-size:100%;'>\"+(this.level+1)+\" hops </span> distance from <span class='blue_text' style='font-size:100%;'>\"+planets[game.capital].name.capitalize()+\"</span>\"; if (this.level == 0) str += \"<br>Allows <span class='blue_text' style='font-size:100%;'>Shipyard</span> construction\"; return str;",
        researchPoint: 3E3,
        mult: 4.3,
        techPoint: 200,
        multBonus: 2
    });
    r.extraBonus = function () {
        4 <= this.level && 0 < game.timeTravelNum && $("#b_diplomacy_icon").show();
        7 <= this.level && $("#b_tournament_icon").show()
    };
    r.extraUnbonus = function () {
        4 >= this.level && $("#b_diplomacy_icon").hide();
        7 >= this.level && $("#b_tournament_icon").hide()
    };
    r.tier = 1;
    r.pos = [0, 0];
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    var chambers = "";
    gameSettings.populationEnabled && (chambers = "<br>Level<span class='blue_text' style='font-size:100%;'>2</span>: Allows <span class='blue_text' style='font-size:100%;'>Cryocell Facility, Hibernation Chamber and Dehibernation Chamber</span> construction");
    r = new Research({
        id: "ice",
        name: "Cryogenics",
        desc: 'var str=""; if (this.level <= 0) str += "Allows <span class=\'blue_text\' style=\'font-size:100%;\'>Ice</span> extraction"; if (this.level <= 1) str += "' + chambers + "\";if (this.level <= 9) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>10</span>: Allows <span class='blue_text' style='font-size:100%;'>Coolant Factory</span> construction\";if (this.level <= 11) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>12</span>: Allows <span class='blue_text' style='font-size:100%;'>Cryogenic Laboratory</span> construction\"; if (this.level >= 12) str += \"<br><span class='blue_text' style='font-size:100%;'>Cryogenic Laboratory</span> production +12%\"; return str;",
        researchPoint: 1E4,
        techPoint: 100,
        multBonus: 1.5
    });
    r.tier = 4;
    r.req = {
        material: 3
    };
    r.pos = [4, 1];
    r.buildingBonus = [{
        id: "icedrill",
        resource: "ice",
        value: 25,
        level: 2
    }, {
        id: "coolfact",
        resource: "coolant",
        value: 12,
        level: 10
    }, {
        id: "ammonia_refrigerator",
        resource: "coolant",
        value: 12,
        level: 1
    }];
    r.extraBonus = function () {
        11 < this.level && (civis[this.civis].buildings[buildingsName.cryolab].researchPoint *= 1.12)
    };
    r.extraUnbonus = function () {
        11 < this.level && (civis[this.civis].buildings[buildingsName.cryolab].researchPoint /= 1.12)
    };
    r.requirement =
        function () {
            return game.searchPlanet(planetsName.vasilis)
        };
    researches.push(r);
    r = new Research({
        id: "marine",
        name: "NONONONO",
        desc: 'return "Allows construction of submerged buildings on ocean planets"; return str;',
        researchPoint: 0
    });
    r.mult = 1;
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return !1
    };
    r.level = 1;
    researches.push(r);
    r = new Research({
        id: "military",
        name: "Military Technology",
        desc: "var str = \"\"; if (this.level <= 0) str = \"Level <span class='blue_text' style='font-size:100%;'>1</span>: Allows <span class='blue_text' style='font-size:100%;'>Ammunition Factory</span> construction\"; if (this.level <= 7) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>8</span>: Allows <span class='blue_text' style='font-size:100%;'>Uranium Shell Assembler</span> construction\"; if (this.level <= 11) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>12</span>: Allows <span class='blue_text' style='font-size:100%;'>Armor Factory</span> construction\"; if (this.level <= 15) str += \"<br>Level<span class='blue_text' style='font-size:100%;'>16</span>: Allows <span class='blue_text' style='font-size:100%;'>Engine Factory</span> construction\"; return str;",
        researchPoint: 33E3,
        techPoint: 50,
        multBonus: 1.3
    });
    r.tier = 3;
    r.pos = [0, 1];
    r.req = {
        astronomy: 4
    };
    r.buildingBonus = [{
        id: "amno",
        resource: "ammunition",
        value: 12,
        level: 2
    }, {
        id: "ufact",
        resource: "u-ammunition",
        value: 12,
        level: 9
    }, {
        id: "armorfact",
        resource: "armor",
        value: 12,
        level: 13
    }, {
        id: "enginefact",
        resource: "engine",
        value: 12,
        level: 17
    }];
    r.requirement = function () {
        return game.searchPlanet(planetsName.uanass)
    };
    researches.push(r);
    r = new Research({
        id: "science",
        name: "Scientific Research",
        desc: "return \"<span class='blue_text' style='font-size:100%;'>All research points</span> production +10%\";",
        researchPoint: 4E4,
        techPoint: 100,
        multBonus: 1.5
    });
    r.tier = 2;
    r.max = 64;
    r.mult = 2.5;
    r.pos = [1, 0];
    r.req = {
        astronomy: 1
    };
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.lab].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.fluidod].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.oceanographic].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.bioengineering].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.haleanResearch].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.cryolab].researchPoint *=
            1.1;
        civis[this.civis].buildings[buildingsName.lavaresearch].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.karanlab].researchPoint *= 1.1;
        civis[this.civis].buildings[buildingsName.karanlab2].researchPoint *= 1.1
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.lab].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.fluidod].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.oceanographic].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.bioengineering].researchPoint /=
            1.1;
        civis[this.civis].buildings[buildingsName.haleanResearch].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.cryolab].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.lavaresearch].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.karanlab].researchPoint /= 1.1;
        civis[this.civis].buildings[buildingsName.karanlab2].researchPoint /= 1.1
    };
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    r = new Research({
        id: "electronics",
        name: "Electronics",
        desc: "var str=\"Allows <span class='blue_text' style='font-size:100%;'>Circuit</span> production\"; if (this.level <= 7) str+=\"<br>Level<span class='blue_text' style='font-size:100%;'>8</span>: Allows <span class='blue_text' style='font-size:100%;'>Batteries</span> production\"; if (this.level >23414) str+=\"<br>Level<span class='blue_text' style='font-size:100%;'>15</span>: Allows <span class='blue_text' style='font-size:100%;'>Superconductors</span> production\"; if (this.level > 14000) str+=\"<br><span class='blue_text' style='font-size:100%;'>Superconductors Factory</span> production +8%\"; return str;",
        researchPoint: 5E4,
        techPoint: 100,
        multBonus: 1.5
    });
    r.tier = 3;
    r.pos = [2, 1];
    r.req = {
        material: 5
    };
    r.buildingBonus = [{
        id: "electronic",
        resource: "circuit",
        value: 30,
        level: 2
    }, {
        id: "battery_factory",
        resource: "empty battery",
        value: 12,
        level: 8
    }];
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    r = new Research({
        id: "nuclear",
        name: "Nuclear Physics",
        desc: "var str =\"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Hydrogen</span> extraction and <span class='blue_text' style='font-size:100%;'>Nuclear Powerplant</span> construction\"; if (this.level <= 2) str+=\"<br>Level<span class='blue_text' style='font-size:100%;'>3</span>: Allows <span class='blue_text' style='font-size:100%;'>Pressurized water reactor</span> construction\"; if (this.level <= 4) str+=\"<br>Level<span class='blue_text' style='font-size:100%;'>5</span>: Allows <span class='blue_text' style='font-size:100%;'>Fusion reactor</span> construction\"; if (this.level >= 5) str+=\"<br><span class='blue_text' style='font-size:100%;'>Fusion Reactor</span>'s Hydrogen consumption -5%\"; return str;",
        researchPoint: 2E5,
        techPoint: 100,
        multBonus: 1.5
    });
    r.tier = 4;
    r.pos = [2, 2];
    r.req = {
        electronics: 1
    };
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.fusion].resourcesProd[resourcesName.hydrogen.id] *= .95
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.fusion].resourcesProd[resourcesName.hydrogen.id] /= .95
    };
    r.requirement = function () {
        return !0
    };
    researches.push(r);
    r = new Research({
        id: "environment",
        name: "Environmental Sciences",
        desc: "var str = \"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Arctic Fishing Outpost, Hunting Spot, Greenhouse, Bioplastic Synthesizer, Biofuel Refinery</span> and <span class='blue_text' style='font-size:100%;'>Bioengineering Center</span> construction\"; if (this.level > 0) str+= \"<span class='blue_text' style='font-size:100%;'>Bioengineering Center</span> production +12%\"; if (this.level < 1) str+= \"<br><span class='blue_text' style='font-size:100%;'>Algae Oil Farm</span> biomass production +1.0\"; return str;",
        researchPoint: 5E5,
        techPoint: 50,
        multBonus: 1.5
    });
    r.pos = [4, 3];
    r.req = {
        hydro: 3
    };
    r.buildingBonus = [{
        id: "fish",
        resource: "biomass",
        value: 25,
        level: 1
    }, {
        id: "hunting",
        resource: "biomass",
        value: 25,
        level: 1
    }, {
        id: "serra",
        resource: "biomass",
        value: 25,
        level: 1
    }, {
        id: "biofuel",
        resource: "fuel",
        value: 25,
        level: 1
    }, {
        id: "algaefarm",
        resource: "biomass",
        value: 25,
        level: 2
    }, {
        id: "biofuel",
        resource: "oil",
        value: 25,
        level: 1
    }, {
        id: "bioplastic",
        resource: "plastic",
        value: 25,
        level: 1
    }, {
        id: "floathouse",
        resource: "biomass",
        value: 25,
        level: 1
    }];
    r.extraBonus =
        function () {
            civis[this.civis].buildings[buildingsName.bioengineering].researchPoint *= 1.12;
            1 == this.level && (civis[this.civis].buildings[buildingsName.algaefarm].resourcesProd[resourcesName.biomass.id] = 1)
        };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.bioengineering].researchPoint /= 1.12;
        1 == this.level && (civis[this.civis].buildings[buildingsName.algaefarm].resourcesProd[resourcesName.biomass.id] = 0)
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.traumland)
    };
    researches.push(r);
    r = new Research({
        id: "halean",
        name: "Halean Technology",
        desc: "var str = \"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Technetium Fissor, Halean Laboratory</span><br>and <span class='blue_text' style='font-size:100%;'>Halean A.I. Center</span> construction\"; if (this.level > 0) str+= \"<span class='blue_text' style='font-size:100%;'>Halean Laboratory</span> production +12%\"; return str;",
        researchPoint: 1E8,
        techPoint: 100,
        multBonus: 1.5
    });
    r.pos = [1, 2];
    r.req = {
        artificial_intelligence: 1
    };
    r.buildingBonus = [{
        id: "fissor",
        resource: "technetium",
        value: 12,
        level: 1
    }, {
        id: "haleanRobots",
        resource: "robots",
        value: 12,
        level: 1
    }];
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.haleanResearch].researchPoint *= 1.12
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.haleanResearch].researchPoint /= 1.12
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.posirion)
    };
    researches.push(r);
    r = new Research({
        id: "artofwar",
        name: "Quris Art of War",
        desc: "var str =\"All friendly ships <span class='blue_text' style='font-size:100%;'>Power, Armor, Shields</span> and <span class='blue_text' style='font-size:100%;'>HPs</span> +5%<br>Foxar, Sky Dragon <span class='blue_text' style='font-size:100%;'>Power, Armor</span> and <span class='blue_text' style='font-size:100%;'>HPs</span> +12%\"; if (this.level == 0) str+= \"<br>Allows <span class='blue_text' style='font-size:100%;'>T-Ammunition Assembler</span> construction\"; return str;",
        researchPoint: 500 * mi,
        techPoint: 50,
        multBonus: 1.3,
        questRequirement: {
            quris_3: 1
        }
    });
    r.buildingBonus = [{
        id: "tfact",
        resource: "t-ammunition",
        value: 12,
        level: 2
    }];
    r.mult = 1.6;
    r.pos = [0, 2];
    r.req = {
        military: 12
    };
    r.extraBonus = function () {
        for (var b = 0; b < game.ships.length; b++) {
            var e = game.ships[b].id;
            5 == e || 6 == e ? (ships[e].power *= 1.12, ships[e].armor *= 1.12, ships[e].hp *= 1.12) : (ships[e].power *= 1.05, ships[e].armor *= 1.05, ships[e].hp *= 1.05, ships[e].shield *= 1.05)
        }
    };
    r.extraUnbonus = function () {
        for (var b = 0; b < game.ships.length; b++) {
            var e =
                game.ships[b].id;
            5 == e || 6 == e ? (ships[e].power /= 1.12, ships[e].armor /= 1.12, ships[e].hp /= 1.12) : (ships[e].power /= 1.05, ships[e].armor /= 1.05, ships[e].hp /= 1.05, ships[e].shield /= 1.05)
        }
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.antaris) || quests[questNames.quris_3].done
    };
    researches.push(r);
    r = new Research({
        id: "nononono",
        name: "Methane Extraction",
        desc: 'return "Allow methane production ";',
        researchPoint: 2E4
    });
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return !1
    };
    researches.push(r);
    r = new Research({
        id: "artificial_intelligence",
        name: "Artificial Intelligence",
        desc: "var str=\"\"; if (this.level == 0) str+=\"<br>Allows <span class='blue_text' style='font-size:100%;'>Robots Factory</span> construction\"; if (this.level > 0) str+=\"<span class='blue_text' style='font-size:100%;'>Robots Factory</span> production +12%\"; return str;",
        researchPoint: 5E7
    });
    r.pos = [1, 1];
    r.req = {
        electronics: 8
    };
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.robotfact].resourcesProd[resourcesName.robots.id] *=
            1.12;
        civis[this.civis].buildings[buildingsName.robotfact].pollution *= 1.3
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.robotfact].resourcesProd[resourcesName.robots.id] /= 1.12;
        civis[this.civis].buildings[buildingsName.robotfact].pollution /= 1.3
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.zelera)
    };
    researches.push(r);
    r = new Research({
        id: "vulcan",
        name: "Vulcanology",
        desc: "var str=\"\"; if (this.level == 0) str+=\"<br>Allows <span class='blue_text' style='font-size:100%;'>Vulcan Observatory, Lava Mine</span> and<br><span class='blue_text' style='font-size:100%;'>Carbon-Sulfur Mine</span> construction\"; if (this.level > 0) str+=\"<span class='blue_text' style='font-size:100%;'>Vulcan Observatory</span> production +12%\"; return str;",
        researchPoint: 200 * mi,
        techPoint: 100,
        multBonus: 1.5
    });
    r.pos = [4, 0];
    r.req = {
        mineralogy: 17
    };
    r.buildingBonus = [{
        id: "lavamine",
        resource: "graphite",
        value: 12,
        level: 1
    }, {
        id: "lavamine",
        resource: "sulfur",
        value: 12,
        level: 1
    }, {
        id: "lavamine2",
        resource: "titanium",
        value: 12,
        level: 1
    }];
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.lavaresearch].researchPoint *= 1.12
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.lavaresearch].researchPoint /= 1.12
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.nassaus)
    };
    researches.push(r);
    r = new Research({
        id: "hydro",
        name: "Hydrology",
        desc: "var str=\"\"; if (this.level == 0) str+=\"Allows construction of buildings on ocean planets\"; if (this.level > 0) str+=\"<span class='blue_text' style='font-size:100%;'>Electrolyzer</span> - <span class='blue_text' style='font-size:100%;'>Water</span> consumption +12%<br><span class='blue_text' style='font-size:100%;'>Oceanographic Center</span> production +12%\"; if (this.level > 0 && game.researches[researchesName[\"material\"]].level >= 15) str+=\"<br><span class='blue_text' style='font-size:100%;'>Nanotubes Dome</span> - <span class='blue_text' style='font-size:100%;'>Nanotubes</span> production +8%\"; return str;",
        researchPoint: 2E4,
        techPoint: 50,
        multBonus: 1.5
    });
    r.pos = [4, 2];
    r.req = {
        chemical: 3
    };
    r.buildingBonus = [{
        id: "pump",
        resource: "water",
        value: 12,
        level: 1
    }, {
        id: "pumpplt",
        resource: "water",
        value: 12,
        level: 1
    }, {
        id: "algaefarm",
        resource: "oil",
        value: 12,
        level: 1
    }, {
        id: "electrolyzer",
        resource: "hydrogen",
        value: 12,
        level: 1
    }, {
        id: "marineref",
        resource: "fuel",
        value: 8,
        level: 1
    }];
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.oceanographic].researchPoint *= 1.12;
        civis[this.civis].buildings[buildingsName.electrolyzer].resourcesProd[resourcesName.water.id] *=
            1.12;
        civis[this.civis].buildings[buildingsName.nanomarine].resourcesProd[resourcesName.nanotubes.id] *= 1.08;
        civis[this.civis].buildings[buildingsName.marineref].resourcesProd[resourcesName.fuel.id] *= 1.08
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.oceanographic].researchPoint /= 1.12;
        civis[this.civis].buildings[buildingsName.electrolyzer].resourcesProd[resourcesName.water.id] /= 1.12;
        civis[this.civis].buildings[buildingsName.nanomarine].resourcesProd[resourcesName.nanotubes.id] /=
            1.08;
        civis[this.civis].buildings[buildingsName.marineref].resourcesProd[resourcesName.fuel.id] /= 1.08
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.aequoreas)
    };
    researches.push(r);
    r = new Research({
        id: "rhodium",
        name: "Metallokopta's Science",
        desc: "var str=\"\"; if (this.level == 0) str+=\"Allows construction of <span class='blue_text' style='font-size:100%;'>Rhodium Extractor and Rhodium Sand Smelter</span>\"; return str;",
        researchPoint: 1E3 * mi,
        techPoint: 500,
        multBonus: 1.35
    });
    r.pos = [3, 3];
    r.req = {
        chemical: 17
    };
    r.buildingBonus = [{
        id: "rhodiumext",
        resource: "rhodium",
        value: 12,
        level: 2
    }, {
        id: "rhodiumext",
        resource: "titanium",
        value: 12,
        level: 2
    }, {
        id: "rhodiumsand",
        resource: "silicon",
        value: 8,
        level: 2
    }, {
        id: "sandsmelt",
        resource: "silicon",
        value: 8,
        level: 2
    }];
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return game.searchPlanet(planetsName.tsartasis)
    };
    researches.push(r);
    r = new Research({
        id: "osmium",
        name: "Metallokopta's Biology",
        desc: "var str=\"\"; if (this.level == 0) str+=\"Allows construction of <span class='blue_text' style='font-size:100%;'>Osmium Extractor and Metallokopta Clonator</span>\"; if (this.level > 0) str+=\"<span class='blue_text' style='font-size:100%;'>Osmium Extractor and Metallokopta Clonator</span> production +5%\"; return str;",
        researchPoint: 5 * bi
    });
    r.pos = [3, 4];
    r.req = {
        rhodium: 2
    };
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.osmiumext].resourcesProd[resourcesName.osmium.id] *= 1.05;
        civis[this.civis].buildings[buildingsName.mkclone].resourcesProd[resourcesName["mK Embryo"].id] *= 1.05
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.osmiumext].resourcesProd[resourcesName.osmium.id] /= 1.05;
        civis[this.civis].buildings[buildingsName.mkclone].resourcesProd[resourcesName["mK Embryo"].id] /= 1.05
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.echoes)
    };
    researches.push(r);
    r = new Research({
        id: "quantum",
        name: "Quantum Physics",
        desc: "var str=\"\"; if (this.level == 0) str+=\"Allows construction of <span class='blue_text' style='font-size:100%;'>Particle Accelerator</span> and <span class='blue_text' style='font-size:100%;'>Antimatter Collider</span>\"; if (this.level > 0) str+=\"<span class='blue_text' style='font-size:100%;'>Particle Accelerator</span> production +12%\"; return str;",
        researchPoint: 2E3 * mi
    });
    r.pos = [1, 3];
    r.req = {
        halean: 4
    };
    r.extraBonus = function () {
        1 < this.level && (civis[this.civis].buildings[buildingsName.particle].resourcesProd[resourcesName.antimatter.id] *= 1.12)
    };
    r.extraUnbonus = function () {
        1 < this.level && (civis[this.civis].buildings[buildingsName.particle].resourcesProd[resourcesName.antimatter.id] /= 1.12)
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.zhura)
    };
    researches.push(r);
    r = new Research({
        id: "secret",
        name: "Secrets of Space-Time",
        desc: "var str=\"\"; str+=\"Allows the construction of <span class='blue_text' style='font-size:100%;'>Wahrian Space Gate</span> and <span class='blue_text' style='font-size:100%;'>Wahrian Time Machine</span>\"; return str;",
        researchPoint: 50 * bi
    });
    r.max = 1;
    r.pos = [2, 3];
    r.req = {
        quantum: 2,
        nuclear: 14,
        rhodium: 3
    };
    r.extraBonus = function () {
        game.maps[1] = 1
    };
    r.extraUnbonus = function () {
        delete game.maps[1]
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.xora)
    };
    researches.push(r);
    r = new Research({
        id: "karan_artofwar",
        name: "Karan Art of War",
        desc: "var str =\"<span class='blue_text' style='font-size:100%;'>Luxis</span> and <span class='blue_text' style='font-size:100%;'>Siber</span> x1.3 piercing power up to 100%\"; str +=\"<br><span class='blue_text' style='font-size:100%;'>Resources cost</span> of friendly ships -8%\"; str +=\"<br><span class='blue_text' style='font-size:100%;'>Muralla's</span> weight +50%\"; return str;",
        researchPoint: 200 * bi,
        techPoint: 1200,
        multBonus: 2
    });
    r.pos = [0, 3];
    r.req = {
        artofwar: 12
    };
    r.max = 111;
    r.extraBonus = function () {
        for (var b = 0; b < game.ships.length; b++) {
            var e = game.ships[b].id;
            ships[e].piercing *= 1.3;
            for (var d = 0; d < resNum; d++) ships[e].cost[d] *= .92
        }
        ships[11].weight *= 1.5
    };
    r.extraUnbonus = function () {
        for (var b = 0; b < game.ships.length; b++) {
            var e = game.ships[b].id;
            ships[e].piercing /= 1.3;
            for (var d = 0; d < resNum; d++) ships[e].cost[d] /= .92
        }
        ships[11].weight /= 1.5
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.alfari)
    };
    researches.push(r);
    r = new Research({
        id: "energetics",
        name: "Wahrian Energetics",
        desc: "var str =\"<span class='blue_text' style='font-size:100%;'>Luxis</span> and <span class='blue_text' style='font-size:100%;'>Siber</span> x1.3 piercing power\"; str +=\"<span class='blue_text' style='font-size:100%;'>Speed</span> of friendly ships +0.1\"; return str;",
        researchPoint: 800 * bi,
        techPoint: 2E3,
        multBonus: 2
    });
    r.mult = 3;
    r.pos = [2, 4];
    r.req = {
        secret: 1
    };
    r.max = 111;
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return !1
    };
    researches.push(r);
    r = new Research({
        id: "space_mining",
        name: "Space Mining",
        desc: "var str =\"<span class='blue_text' style='font-size:100%;'>Medusa Miner</span> ship. Each miner in a fleet will give +10% extraction bonus to the planet it orbits.\"; return str;",
        researchPoint: 2 * tri,
        techPoint: 5E3,
        multBonus: 2
    });
    r.mult = 3;
    r.pos = [2, 4];
    r.req = {
        secret: 1
    };
    r.max = 1;
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return game.searchPlanet(planetsName.swamp)
    };
    researches.push(r);
    r = new Research({
        id: "karan_nuclear",
        name: "Karan Nuclear Physics",
        desc: "var str =\"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Caesium and Thorium</span> extraction<br>Allows <span class='blue_text' style='font-size:100%;'>Thorium Reactor, Thorium-Caesium Extractor and Karan Laboratory</span> construction\"; if (this.level <= 1) str+=\"<br>Level <span class='blue_text' style='font-size:100%;'>2</span>: <span class='blue_text' style='font-size:100%;'>Nuclear Powerplant and Pressurized Water Reactor</span> will start consuming <span class='blue_text' style='font-size:100%;'>Thorium</span><br>\";  if (this.level >= 2) str+=\"<span class='blue_text' style='font-size:100%;'>Nuclear Powerplant, Pressurized Water Reactor, </span><br>\";  if (this.level >= 1 && game.researches[researchesName.ammonia_chemistry].level >= 1) str+=\"<span class='blue_text' style='font-size:100%;'>Pressurized Ammonia Reactor and </span>\"; if (this.level >= 1) str+=\"<span class='blue_text' style='font-size:100%;'>Thorium Reactor</span>'s Energy production +5%<br><span class='blue_text' style='font-size:100%;'>Karan Laboratory</span>'s Research Points production +20%\"; return str;",
        researchPoint: 250 * bi,
        techPoint: 2E3,
        multBonus: 1.5
    });
    r.tier = 5;
    r.pos = [1, 4];
    r.req = {
        quantum: 6
    };
    r.buildingBonus = [{
        id: "thoriumext",
        resource: "thorium",
        value: 25,
        level: 2
    }, {
        id: "thoriumext",
        resource: "caesium",
        value: 25,
        level: 2
    }];
    r.extraBonus = function () {
        civis[this.civis].buildings[buildingsName.thorium_reactor].energy *= 1.05;
        civis[this.civis].buildings[buildingsName.thorium_reactor2].energy *= 1.05;
        civis[this.civis].buildings[buildingsName.pressurized_ammonia].energy *= 1.05;
        2 == this.level && (civis[this.civis].buildings[buildingsName.nuclear].resourcesProd[resourcesName.thorium.id] = -1, civis[this.civis].buildings[buildingsName.nuclear].resourcesNeeded[civis[this.civis].buildings[buildingsName.nuclear].resourcesNeeded.length] = resourcesName.thorium.id, civis[this.civis].buildings[buildingsName.pressurized].resourcesProd[resourcesName.thorium.id] = -1, civis[this.civis].buildings[buildingsName.pressurized].resourcesNeeded[civis[this.civis].buildings[buildingsName.pressurized].resourcesNeeded.length] = resourcesName.thorium.id, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesProd[resourcesName.thorium.id] = -1, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesNeeded[civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesNeeded.length] = resourcesName.thorium.id);
        1 < this.level && (civis[this.civis].buildings[buildingsName.karanlab].researchPoint *= 1.2, civis[this.civis].buildings[buildingsName.karanlab2].researchPoint *= 1.2, civis[this.civis].buildings[buildingsName.nuclear_radio].energy *= 1.05, civis[this.civis].buildings[buildingsName.nuclear].energy *= 1.05, civis[this.civis].buildings[buildingsName.pressurized].energy *=
            1.05);
        2 < this.level && (civis[this.civis].buildings[buildingsName.nuclear].resourcesProd[resourcesName.thorium.id] *= 1.18, civis[this.civis].buildings[buildingsName.nuclear].resourcesProd[resourcesName.uranium.id] *= .92, civis[this.civis].buildings[buildingsName.pressurized].resourcesProd[resourcesName.thorium.id] *= 1.18, civis[this.civis].buildings[buildingsName.pressurized].resourcesProd[resourcesName.uranium.id] *= .92, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesProd[resourcesName.thorium.id] *=
            1.18, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesProd[resourcesName.uranium.id] *= .92)
    };
    r.extraUnbonus = function () {
        civis[this.civis].buildings[buildingsName.thorium_reactor].energy /= 1.05;
        civis[this.civis].buildings[buildingsName.thorium_reactor2].energy /= 1.05;
        civis[this.civis].buildings[buildingsName.pressurized_ammonia].energy /= 1.05;
        2 == this.level && (civis[this.civis].buildings[buildingsName.nuclear].resourcesProd[resourcesName.thorium.id] = 0, civis[this.civis].buildings[buildingsName.pressurized].resourcesProd[resourcesName.thorium.id] =
            0, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesProd[resourcesName.thorium.id] = 0, delete civis[this.civis].buildings[buildingsName.nuclear].resourcesNeeded[civis[this.civis].buildings[buildingsName.nuclear].resourcesNeeded.length], delete civis[this.civis].buildings[buildingsName.pressurized].resourcesNeeded[civis[this.civis].buildings[buildingsName.pressurized].resourcesNeeded.length], delete civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesNeeded[civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesNeeded.length]);
        1 < this.level && (civis[this.civis].buildings[buildingsName.karanlab].researchPoint /= 1.2, civis[this.civis].buildings[buildingsName.karanlab2].researchPoint /= 1.2, civis[this.civis].buildings[buildingsName.nuclear_radio].energy /= 1.05, civis[this.civis].buildings[buildingsName.nuclear].energy /= 1.05, civis[this.civis].buildings[buildingsName.pressurized].energy /= 1.05);
        2 < this.level && (civis[this.civis].buildings[buildingsName.nuclear].resourcesProd[resourcesName.thorium.id] /= 1.18, civis[this.civis].buildings[buildingsName.nuclear].resourcesProd[resourcesName.uranium.id] /=
            .92, civis[this.civis].buildings[buildingsName.pressurized].resourcesProd[resourcesName.thorium.id] /= 1.18, civis[this.civis].buildings[buildingsName.pressurized].resourcesProd[resourcesName.uranium.id] /= .92, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesProd[resourcesName.thorium.id] /= 1.18, civis[this.civis].buildings[buildingsName.nuclear_radio].resourcesProd[resourcesName.uranium.id] /= .92)
    };
    r.requirement = function () {
        return game.searchPlanet(planetsName.xeno)
    };
    researches.push(r);
    r =
        new Research({
            id: "time_eng",
            name: "Time Engineering",
            desc: "var str =\"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Caesium and Thorium</span> extraction<br>Allows <span class='blue_text' style='font-size:100%;'>Thorium Reactor, </span> construction\"; if (this.level >= 1) str+=\"<br><span class='blue_text' style='font-size:100%;'>Thorium Reactor</span>'s Hydrogen consumption -5%\"; return str;",
            researchPoint: 800 * bi,
            techPoint: 100,
            multBonus: 1.5
        });
    r.tier = 5;
    r.pos = [2, 5];
    r.req = {
        energetics: 2
    };
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return !1
    };
    researches.push(r);
    r = new Research({
        id: "ammonia_chemistry",
        name: "Nitrogen Chemistry",
        desc: "var str =\"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Ammonia extraction</span> extraction<br>Allows <span class='blue_text' style='font-size:100%;'>Ammonia Refrigerator, Ammonia Electrolyzer and Pressurized Ammonia Reactor</span> construction\"; return str;",
        researchPoint: 600 * bi,
        techPoint: 1E3,
        multBonus: 1.5
    });
    r.tier = 5;
    r.pos = [4, 4];
    r.req = {
        environment: 20
    };
    r.buildingBonus = [{
        id: "ammonia_ext",
        resource: "ammonia",
        value: 25,
        level: 2
    }, {
        id: "ammonia_refrigerator",
        resource: "coolant",
        value: 25,
        level: 2
    }, {
        id: "ammonia_electro",
        resource: "ammonia",
        value: 25,
        level: 2
    }, {
        id: "ammonia_electro",
        resource: "hydrogen",
        value: 25,
        level: 2
    }];
    r.extraBonus = function () {};
    r.extraUnbonus = function () {};
    r.requirement = function () {
        return game.searchPlanet(planetsName.auriga)
    };
    researches.push(r);
    r = new Research({
        id: "demographics",
        name: "Demographics",
        desc: "var str =\"\"; if (this.level == 0) str+= \"Allows <span class='blue_text' style='font-size:100%;'>Residential Complex and Human Aquarium</span> construction\"; if (this.level >= 1) str+=\"<br><span class='blue_text' style='font-size:100%;'>Habitable Space</span> of residential buildings +25%\";if (this.level <= 5) str += \"<br>Level <span class='blue_text' style='font-size:100%;'>5</span>: Allows <span class='blue_text' style='font-size:100%;'>Orbital Colony</span> construction\"; if (this.level <= 10) str += \"<br>Level <span class='blue_text' style='font-size:100%;'>10</span>: Allows <span class='blue_text' style='font-size:100%;'>Clonation Center</span> construction\"; return str;",
        researchPoint: 5E4,
        techPoint: 100,
        multBonus: 1.35
    });
    r.tier = 1;
    r.pos = [2, 0];
    r.req = {
        science: 1
    };
    r.extraBonus = function () {
        1 < this.level && (civis[this.civis].buildings[buildingsName.residential].habitableSpace *= 1.25);
        1 < this.level && (civis[this.civis].buildings[buildingsName.aquarium].habitableSpace *= 1.25);
        5 < this.level && (civis[this.civis].buildings[buildingsName.floathaus].habitableSpace *= 1.25)
    };
    r.extraUnbonus = function () {
        1 < this.level && (civis[this.civis].buildings[buildingsName.residential].habitableSpace /= 1.25);
        1 < this.level && (civis[this.civis].buildings[buildingsName.aquarium].habitableSpace /= 1.25);
        5 < this.level && (civis[this.civis].buildings[buildingsName.floathaus].habitableSpace /= 1.25)
    };
    r.requirement = function () {
        return 0 < this.level
    };
    researches.push(r);
    var researchesNum = researches.length;
    for (i = 0; i < 100 - researches.length; i++) r = new Research({
            id: "placeholder",
            name: "Placeholder",
            desc: 'return "Allow methane production ";',
            researchPoint: 2E4
        }), r.extraBonus = function () {}, r.extraUnbonus = function () {}, r.requirement = function () {
            return !1
        },
        researches.push(r);
    civis[hkj].researches = researches;
    for (r = 0; r < civis[hkj].researches.length; r++) civis[hkj].researches[r].civis = hkj
}
researches = civis[0].researches;
var researchesName = [];
for (i = 0; i < researches.length; i++) researchesName[researches[i].id] = i;
var questLines = [];
questLines.push(new QuestLine({
    id: "city_main",
    name: "Serving The City"
}));
questLines.push(new QuestLine({
    id: "city_main2",
    name: "New Horizons"
}));
questLines.push(new QuestLine({
    id: "city_parallel",
    name: "The New Order"
}));
questLines.push(new QuestLine({
    id: "pirates_main",
    name: "The March of Freedom"
}));
questLines.push(new QuestLine({
    id: "pirates_main2",
    name: "Chant Down Babylon"
}));
questLines.push(new QuestLine({
    id: "city_main",
    name: "Serving The City"
}));
questLines.push(new QuestLine({
    id: "city_main",
    name: "Serving The City"
}));
var questLinesNames = [];
for (q = 0; q < questLines.length; q++) questLinesNames[questLines[q].id] = q;
var allCivis = [];
for (i = 0; i < civis.length; i++) allCivis[i] = civis[i].id;
quests.push(new Quest({
    id: "city_0",
    name: "[Bounty] Destroy Pirates of Antirion",
    description: "The pirates of Antirion has infested this sector of the galaxy for too long. The time of their punishment has come.",
    repReward: 50,
    provider: civisName.city,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.quris, civisName.andromeda],
    planet: planetsName.mexager,
    objective: "<span class='white_text'>Conquer</span><span class='blue_text'> Antirion</span>",
    resources: {},
    check: function () {
        return game.searchPlanet(planetsName.uanass)
    }
}));
quests.push(new Quest({
    id: "city_1",
    name: "[Resource Request] Water Shortage",
    description: "The City's natural stock of water and ice is almost extinguished. We will be immensely grateful toward any external help.",
    repReward: 50,
    provider: civisName.city,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.quris, civisName.andromeda],
    questRequired: ["city_0"],
    planet: planetsName.mexager,
    resources: {
        water: 1E5
    }
}));
quests.push(new Quest({
    id: "city_2",
    name: "[Resource Request] Hydrogen Shortage",
    description: "The City's energy industry is collapsing due to recent shortages of resources. We will be immensely grateful toward any external help.",
    repReward: 100,
    provider: civisName.city,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.quris, civisName.andromeda],
    questRequired: ["city_1"],
    planet: planetsName.mexager,
    resources: {
        hydrogen: 25E4
    }
}));
quests.push(new Quest({
    id: "city_3",
    name: "[Resource Request] Titanium Shortage",
    description: "The City is slowly recovering thanks to your help. Help us to upgrade our production lines with a donation of titanium.",
    repReward: 100,
    provider: civisName.city,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.quris, civisName.andromeda],
    questRequired: ["city_2"],
    planet: planetsName.mexager,
    resources: {
        titanium: 5E5
    }
}));
quests.push(new Quest({
    id: "city_4",
    name: "[Resource Request] Plastic Shortage",
    description: "The City is strengthening its fleet. A donation of plastic could help The City to become once again the military power it was before. We will give you a relic of our old empire in exchange for this service.",
    goal: {
        type: "res",
        res: {
            id: "hydrogen",
            value: 1E5
        },
        planet: planetsName.mexager
    },
    repReward: 195,
    provider: civisName.city,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.quris, civisName.andromeda],
    questRequired: ["city_3"],
    bonusDescription: "<span class='blue_text'>" + artifacts[artifactsName.thoroid].name + "</span><span class='white_text'> artifact,</span><span class='red_text'> The City gains a new Fleet</span>",
    planet: planetsName.mexager,
    resources: {
        plastic: 1E5
    },
    bonusReward: function () {
        artifacts[artifactsName.thoroid].collect();
        var b = new Fleet(1, "Moon Shatterer");
        b.ships[3] = 150;
        b.ships[4] = 80;
        b.ships[5] = 50;
        b.ships[8] = 20;
        b.ships[15] = 5;
        b.ships[16] = 2;
        b.exp = 6;
        planets[planetsName.mexager].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "city_5",
    name: "[Diplomatic Mission] Meeting with Queen Ramona",
    description: "The Crimson Queen herself wants to make you an offer of frendship. But be aware, enemies of The City will start to look at you under a new darker light.",
    repReward: 5,
    provider: civisName.city,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.quris, civisName.andromeda],
    bonusDescription: "<span class='blue_text'>Ammunition</span><span class='white_text'> available in the market, </span><span class='red_text'>-500</span><span class='white_text'> reputation points with </span><span class='blue_text'>Fallen Human Empire</span>",
    questRequired: ["city_4"],
    planet: planetsName.mexager,
    resources: {
        hydrogen: 25E4
    },
    bonusReward: function () {
        setRep(game.id, civisName.traum, game.reputation[civisName.traum] - 500)
    }
}));
quests.push(new Quest({
    id: "pirates_1",
    name: "[Attack] The Bloody City",
    description: "",
    provider: civisName.pirates
}));
quests.push(new Quest({
    id: "quris_1",
    name: "[Tournament] Apprentice",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge? You will gain points by fighting fleets in the tournament",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 2 points in </span><span class='blue_text'>Quris Tournament</span>",
    repReward: 10,
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    bonusRequirement: function () {
        return 6 >
            game.researches[3].level ? !1 : !0
    },
    check: function () {
        return 1 <= qurisTournament.points ? !0 : !1
    }
}));
quests.push(new Quest({
    id: "quris_2",
    name: "[Tournament] Senior",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 3 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='white_text'> 250K </span><span class='blue_text'>Ammunition</span>",
    repReward: 20,
    questRequired: ["quris_1"],
    civisSupported: [civisName.player, civisName.traumland, civisName.orion,
civisName.zelera, civisName.tataridu],
    check: function () {
        return 2 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        planets[game.capital].resources[resourcesName.ammunition.id] += 25E4
    }
}));
quests.push(new Quest({
    id: "quris_3",
    name: "[Tournament] Master",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 5 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='white_text'> 1 </span><span class='blue_text'>" + ships[34].name + "</span><span class='white_text'> ship, </span><span class='blue_text'>Quris Art of War</span><span class='white_text'> research</span>",
    repReward: 40,
    questRequired: ["quris_2"],
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    check: function () {
        return 4 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        var b = new Fleet(0, "Master Reward");
        b.ships[34] = 1;
        planets[game.capital].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "quris_4",
    name: "[Tournament] Officer",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 8 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='white_text'> 5M </span><span class='blue_text'>Ammunition</span>",
    repReward: 80,
    questRequired: ["quris_3"],
    civisSupported: [civisName.player, civisName.traumland, civisName.orion,
civisName.zelera, civisName.tataridu],
    check: function () {
        return 7 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        planets[game.capital].resources[resourcesName.ammunition.id] += 5 * mi
    }
}));
quests.push(new Quest({
    id: "quris_5",
    name: "[Tournament] Lieutenant",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 16 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='white_text'> 5 </span><span class='blue_text'>" + ships[34].name + "</span><span class='white_text'> ship</span>",
    repReward: 160,
    questRequired: ["quris_4"],
    civisSupported: [civisName.player,
civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    check: function () {
        return 15 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        var b = new Fleet(0, "Lieutenant Reward");
        b.ships[34] = 5;
        planets[game.capital].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "quris_6",
    name: "[Tournament] Commander",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 32 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='blue_text'>" + artifacts[artifactsName.quris_value].name + "</span><span class='white_text'> artifact, 10 </span><span class='blue_text'>" + ships[35].name + "</span><span class='white_text'> ship</span>",
    repReward: 320,
    questRequired: ["quris_5"],
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    check: function () {
        return 31 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        artifacts[artifactsName.quris_value].collect();
        var b = new Fleet(0, "Commander Reward");
        b.ships[35] = 10;
        planets[game.capital].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "quris_7",
    name: "[Tournament] Captain",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 64 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='white_text'> 200 </span><span class='blue_text'>" + ships[36].name + "</span><span class='white_text'> ship</span>",
    repReward: 640,
    questRequired: ["quris_6"],
    civisSupported: [civisName.player,
civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    check: function () {
        return 63 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        var b = new Fleet(0, "Captain Reward");
        b.ships[36] = 200;
        planets[game.capital].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "quris_8",
    name: "[Tournament] Commodore",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 128 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='blue_text'>" + artifacts[artifactsName.quris_honor].name + "</span><span class='white_text'> artifact, 5M </span><span class='blue_text'>" + ships[37].name + "</span><span class='white_text'> ship</span>",
    repReward: 1280,
    questRequired: ["quris_7"],
    civisSupported: [civisName.player, civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    check: function () {
        return 127 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        artifacts[artifactsName.quris_honor].collect();
        var b = new Fleet(0, "Commodore Reward");
        b.ships[37] = 5E6;
        planets[game.capital].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "quris_9",
    name: "[Tournament] Admiral",
    description: "Many seek glory in the Quris Tournament but few succeed, are you up to the challenge?",
    provider: civisName.quris,
    objective: "<span class='white_text'>Reach 256 points in </span><span class='blue_text'>Quris Tournament</span>",
    bonusDescription: "<span class='white_text'> 1B </span><span class='blue_text'>" + ships[38].name + "</span><span class='white_text'> ship</span>",
    repReward: 2450,
    questRequired: ["quris_8"],
    civisSupported: [civisName.player,
civisName.traumland, civisName.orion, civisName.zelera, civisName.tataridu],
    check: function () {
        return 255 <= qurisTournament.points ? !0 : !1
    },
    bonusReward: function () {
        var b = new Fleet(0, "Admiral Reward");
        b.ships[38] = 1E9;
        planets[game.capital].fleetPush(b)
    }
}));
quests.push(new Quest({
    id: "traum_0",
    name: "[Investigation] The kidnapping of Sebastian Jones",
    description: "The Chief of the Traumland Energy Corporation has misteriously disappeared. The Traumland Investigation Bureau has found some evidence of a possible kidnapping by The City's special forces. Given our bad relationships, we need external help to find the truth about what happend to him. Please be aware that your relationship with The City may degrade too.",
    repReward: 100,
    repNeeded: 5E3,
    provider: civisName.traum,
    civisSupported: [civisName.player, civisName.orion, civisName.quris, civisName.andromeda, civisName.phamtids],
    planet: planetsName.lagea,
    objective: "<span class='white_text'>Look for information on </span><span class='blue_text'>The City</span>",
    resources: {},
    check: function () {
        return places[placesNames.taiwan_hotel].done && places[placesNames.maipei_plant].done && places[placesNames.city_market].done
    }
}));
var civisQuest = [];
for (c = 0; c < civis.length; c++) civisQuest[c] = {};
for (q = 0; q < quests.length; q++) questNames[quests[q].id] = q, civisQuest[quests[q].provider][q] = 1;
var saveslot = "sRYGT89ng7m2IzvTTSwagwyh",
    recuvslot = "nxpZ0bQmbK6307XEkzzaYylJ",
    autosave = !0,
    autosaveTime = 7E4,
    autosaveTimer, mainTimer, firstTime = !0,
    mouseX = 0,
    mouseY = 0;

function captur(b) {
    return .8 * (1 - (b - .75) / .25 * (b - .75) / .25)
}
var soundSetting = !0,
    musicSetting = !0,
    currentPlanet = planets[planetsName.promision],
    currentNebula = nebulas[0],
    currentUpdater = function () {},
    capital = planetsName.promision,
    currentPlanetClicker = function () {},
    currentInterface = "",
    currentPopup, currentToast, currentDisplay, currentBuildingId, currentShipId, exportLoadResetInternal, exportLoadResetInternal2, exportPlanetInterface, exportPlanetBuildingInterface, exportResearchInterface, exportTechInterface, exportMapInterface, exportTravelingShipInterface, exportResourcesOverview,
    exportPopup, exportButton, avBuilding = [];
for (i = 0; i < buildings.length; i++) avBuilding[i] = !1;
var avRes = [];
for (i = 0; i < researches.length; i++) avRes[i] = !1;
var avShip = [];
for (i = 0; i < ships.length; i++) avShip[i] = !1;
var avQuest = [],
    elapsed = 0;

function updateResource(b) {
    for (var e = game.id, d = 0; d < civis[e].planets.length; d++) planets[civis[e].planets[d]].produce(b), planets[civis[e].planets[d]].growPopulation(b)
}

function buildQueue() {
    for (var b = 0; b < game.planets.length; b++) {
        var e = planets[game.planets[b]],
            d = !1,
            h;
        for (h in e.queue)
            for (; e.queue[h] && e.buyMultipleStructure(e.queue[h].b, 1, !0);) e.queue[h].n--, d = !0, 0 >= e.queue[h].n && delete e.queue[h];
        d && currentPlanet.id == e.id && exportUpdateBuildingList()
    }
}

function transportResources() {
    if (1 < game.planets.length) {
        var b = planets[game.planetsTransport[0]],
            e = 0;
        for (d in b.queue) e++;
        b.compactQueue();
        var d = !0;
        0 < e ? resourceRequest(b) : d = !1;
        b = game.planetsTransport.length;
        e = game.planetsTransport[0];
        for (var h = 0; h < b - 1; h++) game.planetsTransport[h] = game.planetsTransport[h + 1];
        game.planetsTransport[b - 1] = e;
        return d
    }
    return !0
}

function merge(b, e, d, h) {
    var g = d - e + 1,
        l = h - d,
        m = Array(g + 1),
        t = Array(l + 1),
        x, C;
    for (x = 0; x < g; x++) m[x] = b[e + x - 1];
    for (C = 0; C < l; C++) t[C] = b[d + C];
    m[g] = "l";
    t[l] = "r";
    planets.l = {
        cpd: -1
    };
    planets.r = {
        cpd: -1
    };
    C = x = 0;
    for (--e; e < h; e++) planets[m[x]].cpd >= planets[t[C]].cpd ? (b[e] = m[x], x++) : (b[e] = t[C], C++)
}

function mergeSort(b, e, d) {
    if (e < d) {
        var h = Math.floor((e + d) / 2);
        mergeSort(b, e, h);
        mergeSort(b, h + 1, d);
        merge(b, e, h, d)
    }
}

function mergeIndex(b, e, d, h, g, l) {
    var m = g - h + 1,
        t = l - g,
        x = Array(m + 1),
        C = Array(t + 1),
        E, F;
    for (E = 0; E < m; E++) x[E] = d[h + E - 1];
    for (F = 0; F < t; F++) C[F] = d[g + F];
    x[m] = "l";
    C[t] = "r";
    E = b[h - 1][e];
    for (g = h; g < l; g++) b[g][e] > E && (E = b[g][e]);
    b.l = {};
    b.l[e] = E + 1;
    b.r = {};
    b.r[e] = E + 1;
    F = E = 0;
    for (g = h - 1; g < l; g++) b[x[E]][e] <= b[C[F]][e] ? (d[g] = x[E], E++) : (d[g] = C[F], F++)
}

function mergeObjIndex(b, e, d, h, g) {
    if (h < g) {
        var l = Math.floor((h + g) / 2);
        mergeObjIndex(b, e, d, h, l);
        mergeObjIndex(b, e, d, l + 1, g);
        mergeIndex(b, e, d, h, l, g)
    }
}

function sortObjIndex(b, e) {
    for (var d = Array(b.length), h = 0; h < d.length; h++) d[h] = h;
    mergeObjIndex(b, e, d, 1, d.length);
    return d
}

function sortGenerators(b, e) {
    for (var d = 0; d < b.length; d++) {
        for (var h = planets[b[d]].cpd = 0; h < ships.length; h++) planets[b[d]].cpd += planets[b[d]].fleets.hub.ships[h] * ships[h].maxStorage * ships[h].speed;
        planets[b[d]].cpd /= e.shortestPath[b[d]].distance
    }
    mergeSort(b, 1, b.length)
}
for (var deliveryCount = [], p = 0; p < planets.length; p++)
    for (deliveryCount[p] = [], q = 0; q < planets.length; q++)
        for (deliveryCount[p][q] = [], r = 0; r < resNum; r++) deliveryCount[p][q][r] = 0;

function resourceRequest(b) {
    if (!(1 > b.queue[0].n)) {
        for (var e = [], d = 0, h = 0; h < resNum; h++) e[h] = Math.max(b.resourcesRequest[h], 0), d += e[h];
        for (var g = [], l = 0, m = 0; m < game.planets.length; m++) {
            var t = planets[game.planets[m]];
            t.id != b.id && t.map == b.map && 0 < t.fleets.hub.shipNum() && (g[l] = t.id, l++)
        }
        sortGenerators(g, b);
        for (m = 0; m < g.length; m++) {
            l = planets[g[m]];
            var x = !1;
            t = [];
            var C = 0,
                E = [];
            for (h = 0; h < resNum; h++) E[h] = 0;
            for (var F in l.queue)
                if (l.queue[F]) {
                    var z = l.structure[l.queue[F].b].totalCost(l.queue[F].n);
                    for (h = 0; h < resNum; h++) E[h] +=
                        z[h]
                }
            for (h = 0; h < resNum; h++) {
                z = l.globalProd[h] + l.globalImport[h] - l.globalExport[h];
                if (0 > z) {
                    var v = l.shortestPath[b.id].distance / l.fleets.hub.speed();
                    z = -z * v / 5
                }
                t[h] = Math.ceil(Math.min(e[h], Math.max(l.resources[h] - E[h] - 10 * z, 0)));
                deliveryCount[l.id][b.id][h] >= MAX_AUTO_DELIVERY_PER_PLANET && (t[h] = 0);
                C += t[h]
            }
            for (E = l.fleets.hub; 0 < E.maxStorage() && 0 < d && 0 < C && 0 < b.queue[0].q && !x;) {
                if (x = E.bestCluster()) {
                    z = x.maxStorage() / Math.min(d, C);
                    1 < z && (h = Math.ceil(x.ships[x.onlyS] / z), z = x.ships[x.onlyS] - h, x.ships[x.onlyS] = h, E.ships[x.onlyS] =
                        z, z = 1);
                    for (h = 0; h < resNum; h++)
                        if (v = Math.ceil(t[h] * z), 0 < v) {
                            for (; 0 < v && !x.load(h, v);) --v;
                            l.resourcesAdd(h, -v);
                            d -= v;
                            C -= v;
                            t[h] -= v;
                            e[h] -= v;
                            b.resourcesRequest[h] -= v;
                            0 > b.resourcesRequest[h] && (b.resourcesRequest[h] = 0);
                            deliveryCount[l.id][b.id][h]++
                        }
                    x.name = "[Automatic Delivery]";
                    x.type = "qd";
                    x.move(l.id, b.id)
                }
                x = !0
            }
        }
        e = 0;
        for (F in b.queue) e++;
        1 < e && (F = b.queue[0], delete b.queue[0], b.queue[e] = F, b.compactQueue())
    }
}

function enableResearch() {}
game.routes = routes;

function save26m() {
    try {
        for (var b = 0; b < civis.length; b++) civis[b].lastSaved = (new Date).getTime();
        localStorage.setItem("HGsv0cpt", btoa(capital));
        localStorage.setItem("HGsv0first", firstTime);
        localStorage.setItem("HGsv0plt", btoa(JSON.stringify(planetArraySaver(planets))));
        localStorage.setItem("HGsv0civ", btoa(JSON.stringify(civisArraySaver(civis))));
        var e = {
            schedule: fleetSchedule.toArray(),
            fleets: fleetSchedule.fleets,
            count: fleetSchedule.count
        };
        localStorage.setItem("HGsv0sch", btoa(JSON.stringify(e)));
        if ("info" ==
            currentPopup.type) {
            var d = new exportPopup(210, 0, "<span class='blue_text text_shadow'>Game Saved!<br>If it doesn't work, try exporting the save.</span>", "info");
            d.drawToast()
        }
    } catch (h) {
        console.log(h), "info" == currentPopup.type && (d = new exportPopup(210, 0, "<span class='red_text'>Error during autosave! Check your localStorage settings/quota, or try exporting the game</span>", "info"), d.drawToast())
    }
}

function save() {
    try {
        for (var b = 0; b < civis.length; b++) civis[b].lastSaved = (new Date).getTime();
        localStorage.setItem("HGsv0cpt", btoa(capital));
        localStorage.setItem("HGsv0vers", btoa(GAME_VERSION));
        localStorage.setItem("HGsv0first", firstTime);
        localStorage.setItem("HGsv0plt", btoa(encodeURIComponent(JSON.stringify(planetArraySaver(planets)))));
        localStorage.setItem("HGsv0civ", btoa(encodeURIComponent(JSON.stringify(civisArraySaver(civis)))));
        var e = {};
        for (b = 0; b < fleetSchedule.fleets.length; b++) e[b] = fleetSchedule.fleets[b];
        b = {};
        for (var d = 0; d < artifacts.length; d++) artifacts[d].possessed && (b[artifacts[d].id] = !0);
        var h = {};
        for (d = 0; d < quests.length; d++) quests[d].done && (h[quests[d].id] = !0);
        var g = {};
        for (d = 0; d < places.length; d++) places[d].done && (g[places[d].id] = !0);
        var l = {};
        for (d = 0; d < tutorials.length; d++) tutorials[d].done && (l[tutorials[d].id] = !0);
        var m = {
            schedule: fleetSchedule.toArray(),
            fleets: e,
            count: fleetSchedule.count,
            m: market.toobj(),
            st: gameSettings,
            qur: {
                points: qurisTournament.points,
                lose: qurisTournament.lose
            },
            art: b,
            qst: h,
            plc: g,
            tuts: l
        };
        localStorage.setItem("HGsv0sch", btoa(encodeURIComponent(JSON.stringify(m))));
        var t = new exportPopup(210, 0, "<span class='blue_text text_shadow'>Game Saved!<br>If it doesn't work, try exporting the save.</span>", "info");
        t.drawToast()
    } catch (x) {
        console.log(x), t = new exportPopup(210, 0, "<span class='red_text'>Error during save! Check your localStorage settings/quota, or try exporting the game</span>", "info"), t.drawToast()
    }
}

function saveBase() {
    try {
        for (var b = 0; b < civis.length; b++) civis[b].lastSaved = (new Date).getTime();
        localStorage.setItem("RHGsv0cpt", btoa(capital));
        localStorage.setItem("RHGsv0plt", btoa(JSON.stringify(planetArraySaver(planets))));
        var e = btoa(JSON.stringify(civisArraySaver(civis)));
        localStorage.setItem("RHGsv0civ", e);
        b = {
            schedule: [],
            fleets: {},
            count: 0
        };
        localStorage.setItem("RHGsv0sch", btoa(JSON.stringify(b)));
        internalSave = {
            s: btoa(JSON.stringify(b)),
            p: btoa(JSON.stringify(planetArraySaver30(planets))),
            c: btoa(JSON.stringify(civisArraySaver(civis)))
        }
    } catch (d) {
        console.log(d),
            document.getElementById("l_info") && (document.getElementById("l_info").innerHTML = "Cookies disabled! Please enable them or you won't be able to save the game")
    }
}

function wipeData() {
    for (var b = 0; b < civis.length; b++)
        for (var e = 0; e < civis[b].researches.length; e++) {
            for (var d = civis[b].researches[e].level; 0 < d; d--) civis[b].researches[e].unbonus(), civis[b].researches[e].level--;
            civis[b].researches[e].bonusLevel = 0
        }
    for (b = 0; b < artifacts.length; b++) artifacts[b].uncollect();
    for (b = 0; b < quests.length; b++) quests[b].done = !1;
    for (b = 0; b < tutorials.length; b++) tutorials[b].done = !1;
    localStorage && (localStorage.removeItem("HGsv0cpt"), localStorage.removeItem("HGsv0plt"), localStorage.removeItem("HGsv0civ"),
        localStorage.removeItem("HGsv0sch"));
    exportLoadResetInternal2();
    market = new Market;
    qurisTournament.points = 0;
    game.techPoints = 0;
    game.researchPoint = 0;
    currentNebula = nebulas[0]
}

function prestige() {
    var b = game.totalTPspent() + 2 * game.influence() * Math.log(1 + game.totalRPspent() / (200 * bi)) / Math.log(5),
        e = game.timeTravelNum,
        d = game.years;
    wipeData();
    game.techPoints = b;
    game.timeTravelNum = e + 1;
    exportPermanentMenu();
    (new exportPopup(210, 0, "<span class='blue_text'>You traveled in time! You have been awarded with <span class='white_text'>" + beauty(b) + "</span> Technology Points to spend on researches</span>", "info")).drawToast();
    setTimeout(function () {
        game.researchPoint = 0
    }, 150);
    game.years = d;
    save()
}

function checkRoutes(b, e, d, h) {
    for (var g = [], l = [], m = 0; m < routes.length; m++) routes[m].isPresent(e) && l.push(routes[m]);
    for (m = 0; m < l.length; m++) {
        var t = l[m].other(e);
        b[t] ? b[t].distance > d + l[m].distance() && (b[t].distance = d + l[m].distance(), b[t].route = h, g.push({
            planet: t,
            route: m
        })) : (b[t] = {
            distance: d + l[m].distance(),
            route: h
        }, g.push({
            planet: t,
            route: m
        }))
    }
    for (e = 0; e < g.length; e++) checkRoutes(b, g[e].planet, d + l[g[e].route].distance(), h)
}

function findRoutes() {
    for (var b = 0; b < planets.length; b++) {
        planets[b].shortestPath[b] = {
            distance: 0,
            route: null,
            hops: 0
        };
        for (var e = [], d = 0; d < routes.length; d++) routes[d].isPresent(b) && e.push(routes[d]);
        for (d = 0; d < e.length; d++) planets[b].shortestPath[e[d].other(b)] = {
            distance: e[d].distance(),
            route: e[d].id
        };
        for (d = 0; d < e.length; d++) {
            var h = e[d].other(b);
            checkRoutes(planets[b].shortestPath, h, e[d].distance(), e[d].id)
        }
    }
}

function updateHops() {
    for (var b = 0; b < planets.length; b++)
        for (var e = 0; e < planets.length; e++)
            if (planets[b].shortestPath[e]) {
                var d = shortestRouteId(b, e).length - 2;
                planets[b].shortestPath[e].hops = d
            }
}
findRoutes();
updateHops();

function shortestRoute(b, e) {
    if (b != e) {
        var d = !1,
            h = [],
            g = planets[planetsName[b]];
        if (g.shortestPath[planetsName[e]]) {
            h.push(g.shortestPath[planetsName[e]].distance);
            for (h.push(b); !d;) g = planets[routes[g.shortestPath[planetsName[e]].route].other(g.id)], h.push(g.icon), g.id == planetsName[e] && (d = !0);
            return h
        }
    }
    return [0, b]
}

function shortestRouteId(b, e) {
    if (b != e) {
        var d = !1,
            h = [],
            g = planets[b];
        if (g.shortestPath[e]) {
            h.push(g.shortestPath[e].distance);
            for (h.push(b); !d;) g = planets[routes[g.shortestPath[e].route].other(g.id)], h.push(g.id), g.id == e && (d = !0);
            return h
        }
    }
    return [0, b]
}

function hopNum(b, e, d) {
    b = shortestRouteId(b, e);
    e = 0;
    for (var h = 1; h < b.length && b[h] != d;) e++, h++;
    h >= b.length && (e = -1);
    return e
}

function pathMax() {
    var b = [];
    b.push(0);
    for (var e = 0; e < planets.length; e++)
        for (var d = 0; d < planets.length; d++)
            if (e != d) {
                var h = shortestRoute(planets[e].icon, planets[d].icon);
                h[0] > b[0] && (b = h)
            }
    return b
}

function fakeShips(b) {
    for (var e = 0; e < b; e++) {
        var d = new Fleet;
        d.ships[Math.floor(23 * Math.random())] = 1;
        var h = Math.floor(27 * Math.random());
        fleetSchedule.push(d, h, h, Math.floor(27 * Math.random()), "normal")
    }
}
var mainCycle = 0,
    transportCycle = 0,
    loadReset;
$(document).ready(function () {
    function b() {
        for (var b = 0, d = 0; d < planets.length; d++)
            for (var e in planets[d].fleets) planets[d].fleets[e] && planets[d].fleets[e] == game.id && (b += planets[d].fleets[e].value());
        return parseInt(Math.floor(b))
    }

    function e() {
        var b = JSON.parse(atob(localStorage.getItem("RHGsv0civ")));
        capital = parseInt(atob(localStorage.getItem("RHGsv0cpt")));
        var d = JSON.parse(atob(localStorage.getItem("RHGsv0plt"))),
            e = JSON.parse(atob(localStorage.getItem("RHGsv0sch")));
        firstTime = !0;
        for (var h = 0; h < b.length; h++) civisLoader(civis[h],
            b[h]);
        fleetSchedule.count = e.count;
        b = 0;
        for (var g in e.fleets) b++;
        fleetSchedule.load(e.schedule, e.fleets, b);
        for (g = 0; g < quests.length; g++) quests[g].done = !1;
        for (g = 0; g < artifacts.length; g++) artifacts[g].uncollect();
        e.st && settingsLoader(e.st);
        game = civis[gameSettings.civis];
        for (h = 0; h < d.length; h++) d[h] && planetLoader(planets[h], d[h])
    }

    function d() {
        var b = JSON.parse(atob(internalSave.c)),
            d = JSON.parse(atob(internalSave.p)),
            e = JSON.parse(atob(internalSave.s));
        firstTime = !0;
        for (var h = 0; h < b.length; h++) civisLoader(civis[h],
            b[h]);
        fleetSchedule.count = e.count;
        b = 0;
        for (var g in e.fleets) b++;
        fleetSchedule.load(e.schedule, e.fleets, b);
        for (g = 0; g < quests.length; g++) quests[g].done = !1;
        for (g = 0; g < artifacts.length; g++) artifacts[g].uncollect();
        e.st && settingsLoader(e.st);
        game = civis[gameSettings.civis];
        for (h = 0; h < d.length; h++) d[h] && planetLoader30(planets[h], d[h])
    }

    function h(b, d, e) {
        var h = e || 200;
        $("#" + b).hover(function () {
            (new v(h, 10, d, "info")).drawInfo();
            $(document).on("mousemove", function (b) {
                mouseX = b.pageX + 10;
                b.pageX > GAME_DIMX - h && (mouseX -=
                    h);
                mouseY = b.pageY + 10;
                $("#popup_info").css({
                    left: mouseX,
                    top: mouseY
                })
            });
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        }, function () {
            currentPopup.drop()
        });
        $("#" + b).mouseout(function () {
            $(document).on("mousemove", function () {})
        })
    }

    function g() {
        var b = parseInt(game.days / 365),
            d = parseInt(game.days) - 365 * b,
            e = "<span class='blue_text' >Influence: </span><span class='white_text'>" + game.influence() + "</span><br>";
        5 <= game.researches[3].level && (e += " <span class='blue_text'>Market Coins: </span><span class='white_text'>" +
            beauty(Math.floor(game.money)) + "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'></span>");
        b = "<span class='blue_text' >Year: </span><span class='white_text'>" + b + "</span>" + (" <span class='blue_text'>Day: </span><span class='white_text'>" + d + "</span>");
        document.getElementById("topbar_content") && (document.getElementById("topbar_content").innerHTML = e);
        document.getElementById("topbar_year") && (document.getElementById("topbar_year").innerHTML = b)
    }

    function l() {
        for (var b = 0; b <
            game.buildings.length; b++)
            if (game.buildings[b].show(currentPlanet)) {
                var d = $("#building" + b),
                    e = "blue_text",
                    g = "white_text";
                currentPlanet.structureAffordable(b) ? (e = "blue_text", g = "white_text", avBuilding[b] = !0, d.removeClass("red_button"), d.addClass("button")) : (g = e = "red_text", avBuilding[b] = !1, d.removeClass("button"), d.addClass("red_button"));
                var J = "<div style='width:98%; height:80px;position:relative;'>";
                J += "<div style='position:relative; top:8px; left:8px'>";
                J = currentPlanet.structure[b].active ? J + ("<img id='b_shut_" +
                    b + "' name='" + b + "' src='ui/act.png' style='z-index:10;width:16px;height:16px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>") : J + ("<img id='b_shut_" + b + "' name='" + b + "' src='ui/shut.png' style='z-index:10;width:16px;height:16px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>");
                for (var l = !1, V = 0, w = ""; !l && V < resNum;) l = currentPlanet.globalNoRes[b][V], w = " (needs " + resources[V].name.capitalize() + ")", V++;
                J = l ? J + ("<span class='blue_text' style='font-size: 100%;'>" + game.buildings[b].displayName +
                    " <span class='red_text' style='font-size:80%;' id='b_nores_" + b + "'>" + w + "</span></span> ") : J + ("<span class='blue_text' style='font-size: 100%;'>" + game.buildings[b].displayName + " <span class='red_text' style='font-size:80%;' id='b_nores_" + b + "'></span></span>");
                J += "<span class='white_text'><span id='b_queuen_" + b + "'>" + currentPlanet.structure[b].number;
                for (var T in currentPlanet.queue)
                    if (currentPlanet.queue[T].b == b) {
                        J += " (" + currentPlanet.queue[T].n + " in queue)<img id='b_drop_queue_" + b + "' name='" + b + "' src='ui/x.png' style='width:24px;height:24px;position:relative;top:8px;left:-2px;' style='cursor:pointer;'/>";
                        break
                    }
                J += "</span></span></div>";
                J += "<div style='position:relative; top:16px; left:8px'>";
                for (V = l = 0; V < resNum; V++) w = currentPlanet.structure[b].cost(V), 0 < w && (J += "</div><div style='position:absolute; top:" + (32 + 16 * l) + "px; left: 320px;'>", J += "<span class='" + e + "' id='b_res_" + b + "_" + V + "'>" + resources[V].name.capitalize() + ": </span>", J += "<span class='" + g + "' id='b_cost_" + b + "_" + V + "'>" + beauty(w), gameSettings.showMultipliers && (J += " (x" + game.buildings[b].resourcesMult[V] + ")"), J += "</span><br>", l++);
                J += "</div>";
                J +=
                    "<div style='position:relative; top:16px; left:8px'>";
                J += "<img id='b_build_" + b + "' name='" + b + "' src='ui/add2.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>";
                J += "<img id='b_build10_" + b + "' name='" + b + "' src='ui/add10.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>";
                J += "<img id='b_build50_" + b + "' name='" + b + "' src='ui/add50.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>";
                J += "<img id='b_void' src='ui/void.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;'/>";
                J += "<img id='b_dismantle_" + b + "' name='" + b + "' src='ui/x.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>";
                J += "<img id='b_dismantle10_" + b + "' name='" + b + "' src='ui/x10.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>";
                J += "<img id='b_dismantle50_" + b + "' name='" + b + "' src='ui/x50.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>";
                J += "</div>";
                J += "</div>";
                d.html(J);
                $("#b_drop_queue_" + b).unbind();
                $("#b_drop_queue_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.removeQueue(currentBuildingId);
                    m()
                });
                h("b_drop_queue_" + b, "<span class='blue_text'>Remove from queue</span>", 132);
                $("#b_shut_" + b).unbind();
                $("#b_shut_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.structure[currentBuildingId].active = currentPlanet.structure[currentBuildingId].active ? !1 : !0;
                    m()
                });
                $("#b_build_" +
                    b).unbind();
                $("#b_build_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleStructure(currentBuildingId, 1) ? m() : (new v(210, 0, "<span class='red_text'>There are not enough resources!</span>", "info")).drawToast();
                    $("#b_build_" + parseInt($(this).attr("name"))).mouseenter()
                });
                $("#b_build10_" + b).unbind();
                $("#b_build10_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleStructure(currentBuildingId, 10) ? m() : (new v(210, 0,
                        "<span class='red_text'>There are not enough resources!</span>", "info")).drawToast();
                    $("#b_build10_" + parseInt($(this).attr("name"))).mouseenter()
                });
                $("#b_build50_" + b).unbind();
                $("#b_build50_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleStructure(currentBuildingId, 50) ? m() : (new v(210, 0, "<span class='red_text'>There are not enough resources!</span>", "info")).drawToast();
                    $("#b_build50_" + parseInt($(this).attr("name"))).mouseenter()
                });
                $("#b_dismantle_" +
                    b).unbind();
                $("#b_dismantle_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.sellStructure(currentBuildingId) ? m() : (new v(210, 0, "<span class='red_text'>There are no buildings to dismantle!</span>", "info")).drawToast();
                    $("#b_dismantle_" + parseInt($(this).attr("name"))).mouseenter()
                });
                $("#b_dismantle10_" + b).unbind();
                $("#b_dismantle10_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleStructure(currentBuildingId, 10) ? m() :
                        (new v(210, 0, "<span class='red_text'>There are no buildings to dismantle!</span>", "info")).drawToast();
                    $("#b_dismantle10_" + parseInt($(this).attr("name"))).mouseenter()
                });
                $("#b_dismantle50_" + b).unbind();
                $("#b_dismantle50_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleStructure(currentBuildingId, 50) ? m() : (new v(210, 0, "<span class='red_text'>There are no buildings to dismantle!</span>", "info")).drawToast();
                    $("#b_dismantle50_" + parseInt($(this).attr("name"))).mouseenter()
                });
                $("#b_dismantle_" + b).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(240, 10, currentPlanet.showSellCost(b, 1), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#b_dismantle_" + b).mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
                $("#b_dismantle10_" + b).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(210, 10, currentPlanet.showSellCost(b, 10), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#b_dismantle10_" + b).mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
                $("#b_dismantle50_" + b).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(210, 10, currentPlanet.showSellCost(b, 50), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#b_dismantle50_" + b).mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
                $("#b_build_" + b).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(200, 10, currentPlanet.showBuyCost(b, 1), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#b_build_" + b).mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
                $("#b_build10_" + b).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(200, 10, currentPlanet.showBuyCost(b, 10), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#b_build10_" + b).mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
                $("#b_build50_" + b).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(200, 10, currentPlanet.showBuyCost(b, 50), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#b_build50_" + b).mouseout(function () {
                    $(document).on("mousemove",
                        function () {})
                })
            }
    }

    function m() {
        for (var b = 0; b < game.buildings.length; b++)
            if (game.buildings[b].show(currentPlanet)) {
                var d = $("#building" + b);
                document.getElementById("building" + b);
                currentPlanet.structureAffordable(b) ? (avBuilding[b] = !0, d.removeClass("red_button"), d.addClass("button")) : (avBuilding[b] = !1, d.removeClass("button"), d.addClass("red_button"));
                currentPlanet.structure[b].active ? $("#b_shut_" + b).attr("src", "ui/act.png") : $("#b_shut_" + b).attr("src", "ui/shut.png");
                d = !1;
                for (var e = 0, g = ""; !d && e < resNum;) d =
                    currentPlanet.globalNoRes[b][e], g = " (needs " + resources[e].name.capitalize() + ")", e++;
                d ? $("#b_nores_" + b).html(g) : $("#b_nores_" + b).html("");
                d = "" + currentPlanet.structure[b].number;
                for (var J in currentPlanet.queue)
                    if (currentPlanet.queue[J].b == b) {
                        d += " (" + currentPlanet.queue[J].n + " in queue)<img id='b_drop_queue_" + b + "' name='" + b + "' src='ui/x.png' style='width:24px;height:24px;position:relative;top:8px;left:-2px;' style='cursor:pointer;'/>";
                        break
                    }
                $("#b_queuen_" + b).html(d);
                for (d = 0; d < resNum; d++) e = currentPlanet.structure[b].cost(d),
                    g = "" + beauty(e), gameSettings.showMultipliers && (g += " (x" + game.buildings[b].resourcesMult[d] + ")"), 0 < e && $("#b_cost_" + b + "_" + d).html(g), e <= currentPlanet.resources[d] ? ($("#b_cost_" + b + "_" + d).removeClass("red_text"), $("#b_cost_" + b + "_" + d).addClass("white_text"), $("#b_res_" + b + "_" + d).removeClass("red_text"), $("#b_res_" + b + "_" + d).addClass("blue_text")) : ($("#b_cost_" + b + "_" + d).removeClass("white_text"), $("#b_cost_" + b + "_" + d).addClass("red_text"), $("#b_res_" + b + "_" + d).removeClass("blue_text"), $("#b_res_" + b + "_" + d).addClass("red_text"));
                $("#b_drop_queue_" + b).unbind();
                $("#b_drop_queue_" + b).click(function () {
                    currentBuildingId = parseInt($(this).attr("name"));
                    currentPlanet.removeQueue(currentBuildingId);
                    m()
                });
                h("b_drop_queue_" + b, "<span class='blue_text'>Remove from queue</span>", 132)
            }
    }

    function t() {
        for (var b = [], d = 0; d < game.ships.length; d++) b[d] = game.ships[d].id;
        for (var e = 0; e < b.length; e++) {
            d = b[e];
            var h = $("#shipyard" + e),
                g = document.getElementById("shipyard" + e);
            currentPlanet.shipAffordable(d) ? (h.removeClass("red_button"), h.addClass("button"),
                avShip[d] || (avShip[d] = !0)) : (h.removeClass("button"), h.addClass("red_button"), avBuilding[d] && (avShip[d] = !1));
            if (ships[d].show() && game.ships[e].req <= currentPlanet.structure[buildingsName.shipyard].number) currentPlanet.shipAffordable(d) ? (avShip[d] = !0, h.removeClass("red_button"), h.addClass("button")) : (avShip[d] = !1, h.removeClass("button"), h.addClass("red_button")), h = "<div style='width:98%; height:80px;position:relative;'>", h += "<div style='position:relative; top:8px; left:8px'>", h += "<span class='blue_text' style='font-size: 100%;'>" +
                ships[d].name + "</span> ", h += "<span class='white_text'>" + currentPlanet.shipyardFleet.ships[d] + "</span></div>", h += "<div style='position:relative; top:16px; left:8px'>", h += "</div>", h += "<div style='position:relative; top:16px; left:8px'>", h += "<img id='sh_build_" + d + "' name='" + d + "' src='ui/add2.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_build10_" + d + "' name='" + d + "' src='ui/add10.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>",
                h += "<img id='sh_build100_" + d + "' name='" + d + "' src='ui/add100.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_build1000_" + d + "' name='" + d + "' src='ui/add1000.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_build10000_" + d + "' name='" + d + "' src='ui/add10000.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_void' src='ui/void.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;'/>",
                h += "<img id='sh_dismantle_" + d + "' name='" + d + "' src='ui/x.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_dismantle10_" + d + "' name='" + d + "' src='ui/x10.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_dismantle100_" + d + "' name='" + d + "' src='ui/x100.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_dismantle1000_" +
                d + "' name='" + d + "' src='ui/x1000.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<img id='sh_dismantle10000_" + d + "' name='" + d + "' src='ui/x10000.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "<div style='position:relative; top:-68px;left:66%;'>", h += "<input style='width:64px;height:16px;font-size:92%;position:relative;top:-6px;' id='sh_buildt_" + d + "' name='" + d + "' type='text' value='0' /><img id='sh_buildc_" +
                d + "' name='" + d + "' src='ui/add2.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/><br>", h += "<input style='width:64px;height:16px;font-size:92%;position:relative;top:-6px;' id='sh_dismantlet_" + d + "' name='" + d + "' type='text' value='0' /><img id='sh_dismantlec_" + d + "' name='" + d + "' src='ui/x.png' style='width:32px;height:32px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>", h += "</div>", h += "</div>", h += "</div>", g && (g.innerHTML = h), $("#sh_buildt_" +
                    d).change(function () {
                    var b = parseInt($(this).attr("name"));
                    Number.isInteger(parseInt($(this).val())) ? 0 > parseInt($(this).val()) ? $(this).val(0) : parseInt($(this).val()) >= currentPlanet.maxMultipleShip(b) && $(this).val(currentPlanet.maxMultipleShip(b)) : $(this).val(0);
                    $(this).val(parseInt($(this).val()))
                }), $("#sh_dismantlet_" + d).change(function () {
                    var b = parseInt($(this).attr("name"));
                    Number.isInteger(parseInt($(this).val())) ? 0 > parseInt($(this).val()) ? $(this).val(0) : parseInt($(this).val()) >= currentPlanet.shipyardFleet.ships[b] &&
                        $(this).val(currentPlanet.shipyardFleet.ships[b]) : $(this).val(0);
                    $(this).val(parseInt($(this).val()))
                }), $("#sh_buildc_" + d).unbind(), $("#sh_buildc_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    $("#sh_buildt_" + b).change();
                    currentPlanet.buyMultipleShip(b, parseInt($("#sh_buildt_" + b).val())) ? (currentPlanet.shipyardFleet.pushed || (currentPlanet.fleetPush(currentPlanet.shipyardFleet), currentPlanet.shipyardFleet.pushed = !0), t()) : (t(), (new v(210, 0, "<span class='red_text text_shadow'>There are not enough resources!</span>",
                        "info")).drawToast())
                }), $("#sh_dismantlec_" + d).unbind(), $("#sh_dismantlec_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    $("#sh_dismantlet_" + b).change();
                    currentPlanet.sellMultipleShip(b, parseInt($("#sh_dismantlet_" + b).val())) ? (t(), b = new v(210, 0, "<span class='red_text text_shadow'>Ships dismantled!</span>", "info")) : (t(), b = new v(210, 0, "<span class='red_text text_shadow'>There are no ships to dismantle!</span>", "info"));
                    b.drawToast()
                }), $("#sh_dismantlec_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    $("#sh_dismantlet_" + b).change();
                    (new v(220, 10, currentPlanet.showSellShipCost(b, parseInt($("#sh_dismantlet_" + b).val())), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_dismantlec_" + d).mouseout(function () {
                    var b = parseInt($(this).attr("name"));
                    $("#sh_dismantlet_" + b).change();
                    $(document).on("mousemove", function () {})
                }), $("#sh_buildc_" +
                    d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    $("#sh_buildt_" + b).change();
                    (new v(220, 10, currentPlanet.showBuyShipCost(b, parseInt($("#sh_buildt_" + b).val())), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_buildc_" + d).mouseout(function () {
                    var b = parseInt($(this).attr("name"));
                    $("#sh_buildt_" + b).change();
                    $(document).on("mousemove",
                        function () {})
                }), $("#sh_build_" + d).unbind(), $("#sh_build_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.buyShip(b) ? currentPlanet.shipyardFleet.pushed || (currentPlanet.fleetPush(currentPlanet.shipyardFleet), currentPlanet.shipyardFleet.pushed = !0) : (new v(210, 0, "<span class='red_text text_shadow'>There are not enough resources!</span>", "info")).drawToast();
                    t()
                }), $("#sh_build10_" + d).unbind(), $("#sh_build10_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleShip(b,
                        10) ? currentPlanet.shipyardFleet.pushed || (currentPlanet.fleetPush(currentPlanet.shipyardFleet), currentPlanet.shipyardFleet.pushed = !0) : (new v(210, 0, "<span class='red_text text_shadow'>There are not enough resources!</span>", "info")).drawToast();
                    t()
                }), $("#sh_build100_" + d).unbind(), $("#sh_build100_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleShip(b, 100) ? currentPlanet.shipyardFleet.pushed || (currentPlanet.fleetPush(currentPlanet.shipyardFleet), currentPlanet.shipyardFleet.pushed = !0) : (new v(210, 0, "<span class='red_text text_shadow'>There are not enough resources!</span>", "info")).drawToast();
                    t()
                }), $("#sh_build1000_" + d).unbind(), $("#sh_build1000_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleShip(b, 1E3) ? currentPlanet.shipyardFleet.pushed || (currentPlanet.fleetPush(currentPlanet.shipyardFleet), currentPlanet.shipyardFleet.pushed = !0) : (new v(210, 0, "<span class='red_text text_shadow'>There are not enough resources!</span>", "info")).drawToast();
                    t()
                }), $("#sh_build10000_" + d).unbind(), $("#sh_build10000_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.buyMultipleShip(b, 1E4) ? currentPlanet.shipyardFleet.pushed || (currentPlanet.fleetPush(currentPlanet.shipyardFleet), currentPlanet.shipyardFleet.pushed = !0) : (new v(210, 0, "<span class='red_text text_shadow'>There are not enough resources!</span>", "info")).drawToast();
                    t()
                }), $("#sh_dismantle_" + d).unbind(), $("#sh_dismantle_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleShip(b, 1) || (new v(210, 0, "<span class='red_text text_shadow'>There are no ships to dismantle!</span>", "info")).drawToast();
                    t()
                }), $("#sh_dismantle10_" + d).unbind(), $("#sh_dismantle10_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleShip(b, 10) || (new v(210, 0, "<span class='red_text text_shadow'>There are no ships to dismantle!</span>", "info")).drawToast();
                    t()
                }), $("#sh_dismantle100_" + d).unbind(), $("#sh_dismantle100_" + d).click(function () {
                    var b =
                        parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleShip(b, 100) || (new v(210, 0, "<span class='red_text text_shadow'>There are no ships to dismantle!</span>", "info")).drawToast();
                    t()
                }), $("#sh_dismantle1000_" + d).unbind(), $("#sh_dismantle1000_" + d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleShip(b, 1E3) || (new v(210, 0, "<span class='red_text text_shadow'>There are no ships to dismantle!</span>", "info")).drawToast();
                    t()
                }), $("#sh_dismantle10000_" + d).unbind(), $("#sh_dismantle10000_" +
                    d).click(function () {
                    var b = parseInt($(this).attr("name"));
                    currentPlanet.sellMultipleShip(b, 1E4) || (new v(210, 0, "<span class='red_text text_shadow'>There are no ships to dismantle!</span>", "info")).drawToast();
                    t()
                }), $("#sh_dismantle_" + d).hover(function () {
                    (new v(240, 10, "<span class='blue_text'>Gives 100% of resources back</span>", "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_dismantle_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_dismantle10_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showSellShipCost(b, 10), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_dismantle10_" +
                    d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_dismantle100_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showSellShipCost(b, 100), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_dismantle100_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }),
                $("#sh_dismantle1000_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showSellShipCost(b, 1E3), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_dismantle1000_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_dismantle10000_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showSellShipCost(b, 1E4), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_dismantle10000_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_build_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showBuyShipCost(b, 1), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_build_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_build10_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showBuyShipCost(b, 10), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY +
                            10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_build10_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_build100_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showBuyShipCost(b, 100), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_build100_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_build1000_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showBuyShipCost(b, 1E3), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_build1000_" +
                    d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#sh_build10000_" + d).hover(function () {
                    var b = parseInt($(this).attr("name"));
                    (new v(220, 10, currentPlanet.showBuyShipCost(b, 1E4), "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#sh_build10000_" + d).mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
            else if (game.ships[e].req <= currentPlanet.structure[buildingsName.shipyard].number + 1) {
                h = "<div style='width:98%; height:80px;position:relative;'>";
                h += "<div style='position:relative; top:8px; left:8px'>";
                h += "<span class='red_text' style='font-size: 100%;'>" + ships[d].name + "</span> ";
                h += "<span class='red_text'> - Unlocked by Shipyard " + game.ships[e].req + "</span></div>";
                h += "<div style='position:relative; top:16px; left:8px'>";
                for (var l in game.ships[e].resReq) h += "<span class='red_text'> Needs " + game.researches[researchesName[l]].name +
                    " " + game.ships[e].resReq[l] + "</span>";
                h += "</div>";
                h += "</div>";
                document.getElementById("shipyard_locked" + e) && (document.getElementById("shipyard_locked" + e).innerHTML = h)
            }
        }
    }

    function x() {
        document.getElementById("planet_mini_name") && (document.getElementById("planet_mini_name").innerHTML = currentPlanet.name);
        currentPlanet.id == capital ? $("#planet_mini_name").css("color", "rgb(249,159,36)") : $("#planet_mini_name").css("color", "#80c0ff");
        $("#planet_mini_image").attr("src", "img/" + currentPlanet.icon + "/" + currentPlanet.icon +
            ".png");
        $("#planet_mini_image").unbind();
        $("#planet_mini_image").click(function () {
            A(currentPlanet)
        });
        $("#planet_mini").show()
    }

    function C() {
        document.getElementById("shipyard_mini_name") && (document.getElementById("shipyard_mini_name").innerHTML = currentPlanet.name);
        currentPlanet.id == capital ? $("#shipyard_mini_name").css("color", "rgb(249,159,36)") : $("#shipyard_mini_name").css("color", "#80c0ff");
        $("#shipyard_mini_image").attr("src", "img/" + currentPlanet.icon + "/" + currentPlanet.icon + ".png");
        $("#shipyard_mini_image").click(function () {
            A(currentPlanet)
        });
        $("#shipyard_mini").show()
    }

    function E() {
        document.getElementById("market_mini_name") && (document.getElementById("market_mini_name").innerHTML = currentPlanet.name);
        currentPlanet.id == capital ? $("#market_mini_name").css("color", "rgb(249,159,36)") : $("#market_mini_name").css("color", "#80c0ff");
        $("#market_mini_image").attr("src", "img/" + currentPlanet.icon + "/" + currentPlanet.icon + ".png");
        $("#market_mini_image").click(function () {
            A(currentPlanet)
        });
        $("#market_mini").show()
    }

    function F() {
        if (mainCycle >= fpsFleet / fps) {
            gameSettings.showHub = !0;
            var b = ((new Date).getTime() - Z) / 1E3;
            Z = (new Date).getTime();
            if (0 > b || isNaN(b)) b = .1, console.log(b);
            averageT = (averageT + b) / 2;
            market.esport(b * idleBon);
            game.days += .1 * idleBon * b;
            g();
            for (var d = "<span class='blue_text'> Research Points: </span>", e = 0, h = 0; h < game.planets.length; h++) planets[game.planets[h]].globalProd.researchPoint && (e += planets[game.planets[h]].globalProd.researchPoint);
            game.researchPoint += b * e;
            isNaN(game.researchPoint) && (game.researchPoint = 0);
            d += "<span class='white_text'>" + beauty(game.researchPoint) +
                " (" + (0 < e ? "+" : "") + "" + beauty(e) + "/s)</span>";
            0 < game.timeTravelNum && (d = d + "<br><span class='green_text'> Technology Points: </span>" + ("<span class='green_text'>" + beauty(Math.floor(game.techPoints)) + "</span>"));
            document.getElementById("downbar_content") && (document.getElementById("downbar_content").innerHTML = d);
            currentUpdater();
            updateResource(b);
            mainCycle = 1;
            game.money += b * game.influence();
            isNaN(game.money) && (game.money = 0);
            if (gameSettings.useQueue)
                if (gameSettings.autoQueue && buildQueue(), 2 <= transportCycle) {
                    if (gameSettings.resourceRequest &&
                        gameSettings.showHub)
                        for (d = 0; !transportResources() && d < game.planets.length;) d++;
                    transportCycle = 0
                } else transportCycle += b;
            0 < game.timeTravelNum && questChecker();
            game.idleTime -= b;
            0 > game.idleTime && (game.idleTime = 0);
            tutorialChecker()
        } else mainCycle++;
        b = fleetSchedule.pop();
        e = 0;
        for (d = 1; e < b.length;) planets[b[e].destination].fleets[d] || (planets[b[e].destination].fleets[d] = b[e].fleet, e++), d++;
        "nada" != fleetStr && ((new v(180, 0, fleetStr, "info")).drawToast(), fleetStr = "nada")
    }

    function z(b, d, e, h, g) {
        this.id = b;
        this.func =
            g;
        this.html = "<ul style='width:" + e + "px;float:left;text-align:center;'>";
        this.html += "<li id='" + this.id + "' class='button' style='display:table;height:" + h + "px;width:" + e + "px;'><span class='blue_text' style='display:table-cell;font-size:120%;vertical-align:middle;position:relative;'>" + d + "</span></li></ul>";
        this.getHtml = function () {
            return this.html
        };
        this.enable = function () {
            $("#" + this.id).click(this.func)
        }
    }

    function v(b, d, e, h, g) {
        this.width = b;
        this.height = d;
        this.content = e;
        this.type = h;
        this.func = g;
        switch (h) {
            case "prompt":
                this.func =
                    g;
                this.content += "<br><input id='prompt_value' class='white_text' style='position:absolute; left:32px; width:" + (this.width - 64) + "px; top:48px; border:none; background-color:rgba(75, 129, 156, 0.3);text-align:center;'>";
                this.content += "<br><br><ul style='width:" + this.width + "px; float:left; text-align:center;'>";
                this.content += "<li style='width:" + this.width + "px;'>";
                this.content += "<span id='prompt_ok_button' class='blue_text button text_shadow' style='position:absolute; left:0px; width:" + this.width / 2 + "px;'>Ok</span>";
                this.content += "<span id='prompt_cancel_button' class='blue_text button text_shadow' style='position:absolute; left:" + this.width / 2 + "px; width:" + this.width / 2 + "px;'>Cancel</span>";
                this.content += "</li></ul>";
                break;
            case "info":
                break;
            case "autoDivide":
            case "fleetDivide":
                this.func = g;
                this.content += "<br><div style='text-align:right;max-height:160px;overflow-y:auto;overflow-x:hidden;'>";
                for (e = 0; e < ships.length; e++) 0 < g.ships[e] && (this.content += "<span class='blue_text' style='float:left;margin-left:16px'>" + ships[e].name +
                    "</span><input style='width:64px'id='slide" + e + "' name='" + e + "'type='range' min='0' max='" + g.ships[e] + "' value='0' step='1' /><input style='width:48px;margin-right:16px'id='textval" + e + "' name='" + e + "' type='text' value='0'/><br>");
                this.content += "</div><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Divide</span></li><li id='popup_close_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "loadShip":
                this.func = g;
                this.content += "<br><div style='text-align:right;height:200px;overflow-y:auto;'>";
                e = planets[this.func.planet].rawProduction();
                for (h = 0; h < resNum; h++) 1 <= planets[g.planet].resources[h] && (this.content += "<span class='blue_text' style='float:left;margin-left:16px'>" + resources[h].name.capitalize() + ": <span class='white_text' style='font-size:100%;'> " + beauty(planets[this.func.planet].resources[h]) + " <span class='" +
                    (0 <= e[h] ? 0 < e[h] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < e[h] ? "+" : "") + "" + beauty(e[h]) + "/s)</span></span></span><input style='width:80px'id='res_slide" + h + "' name='" + h + "'type='range' min='0' max='" + Math.min(planets[this.func.planet].resources[h], this.func.availableStorage()) + "' value='0' step='1' /><input style='width:80px'id='res_textval" + h + "' name='" + h + "' type='text' value='0'/><br>");
                this.content += "</div><br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Load resources</span></li><li id='popup_close_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "loadAutoShip":
                this.func = g;
                this.content += "<br><div style='text-align:right;height:200px;overflow-y:auto;'>";
                for (h = 0; h < resNum; h++) 1 <= planets[this.func.planet].resources[h] && (this.content += "<span class='blue_text' style='float:left;margin-left:16px'>" + resources[h].name + "</span><input style='width:80px'id='res_slide" +
                    h + "' name='" + h + "'type='range' min='0' max='" + Math.min(planets[this.func.planet].resources[h], this.func.availableStorage()) + "' value='0' step='1' /><input style='width:80px'id='res_textval" + h + "' name='" + h + "' type='text' value='0'/><br>");
                this.content += "</div><br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Save</span></li><li id='popup_close_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "renameFleet":
                this.func = g;
                e = currentFleetId.split("_");
                e = planets[e[0]].fleets[e[1]];
                this.content += "<br><div >";
                this.content += "<input style='width:320px'id='rename_fleet' type='text' value='" + e.name + "'/><br>";
                this.content += "</div><br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Change Name</span></li><li id='popup_close_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "renameGame":
                this.content += "<br><div >";
                this.content += "<input style='width:320px'id='rename_fleet' type='text' value='" + game.name + "'/><br>";
                this.content += "</div><br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Change Name</span></li><li id='popup_close_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "renameFleetTravel":
                this.func = g;
                this.content += "<br><div >";
                this.content += "<input style='width:320px'id='rename_fleet' type='text' value='" + this.func.name + "'/><br>";
                this.content += "</div><br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Change Name</span></li><li id='popup_close_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "confirm":
                this.content += "<br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Ok</span></li><li id='popup_close_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Cancel</span></li></ul>";
                break;
            case "tutorial":
                this.content += "<br><br><ul style='width: " +
                    this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Continue</span></li><li id='popup_disable_tutorial' class='button text_shadow' style='width: " + this.width + "px;'><span class='blue_text'>Disable Tutorial</span></li></ul>";
                break;
            default:
                this.content += "<br><br><ul style='width: " + this.width + "px; float:left; text-align:center;'><li id='popup_ok_button' class='button text_shadow' style='width: " +
                    this.width + "px;'><span class='blue_text'>Ok</span></li></ul>"
        }
        this.draw = function () {
            currentPopup && currentPopup.drop();
            currentPopup = this;
            document.getElementById("popup_content") && (document.getElementById("popup_content").innerHTML = "<span style='float:left; text-align:center;'>" + this.content + "</span>");
            switch (this.type) {
                case "prompt":
                    this.promptValue = function () {
                        return $("#prompt_value").val()
                    };
                    $("#prompt_ok_button").click(function () {
                        currentPopup.func()
                    });
                    $("#prompt_cancel_button").click(this.drop);
                    break;
                case "buy":
                    $("#popup_ok_button").click(g);
                    $("#popup_leave_button").click(this.drop);
                    break;
                case "info":
                    break;
                case "autoDivide":
                case "fleetDivide":
                    for (var e = 0; e < ships.length; e++) 0 < g.ships[e] && ($("#slide" + e).change(function () {
                        $("#textval" + $(this).attr("name")).val($(this).val())
                    }), $("#textval" + e).change(function () {
                        Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > $("#slide" + $(this).attr("name")).attr("max") && $(this).val($("#slide" + $(this).attr("name")).attr("max")) : $(this).val(0);
                        $("#slide" +
                            $(this).attr("name")).val($(this).val())
                    }));
                    $("#popup_close_button").click(this.drop);
                    $("#popup_ok_button").click(this.drop);
                    "fleetDivide" == this.type ? $("#popup_ok_button").click(function () {
                        for (var b = currentFleetId.split("_"), d = b[0], e = planets[d].fleets[b[1]], h = e.exp, g = e.maxStorage(), u = 0; null != planets[d].fleets[u];) u++;
                        for (var J = 0, Q = 0, l = 0; l < ships.length; l++) $("#slide" + l).val() && (J += parseInt($("#slide" + l).val())), Q += e.ships[l];
                        if (0 == Q) b = new v(210, 0, "<span class='red_text red_text_shadow'>This fleet has no ship!</span>",
                            "info"), b.drawToast();
                        else if (0 == J) b = new v(210, 0, "<span class='red_text red_text_shadow'>You must select at least 1 ship!</span>", "info"), b.drawToast();
                        else {
                            planets[d].fleets[u] = new Fleet(game.id, "div - " + e.name);
                            for (l = 0; l < ships.length; l++) $("#slide" + l).val() && (Q = parseInt($("#slide" + l).val()), planets[d].fleets[u].ships[l] = Q, e.ships[l] -= Q, 0 > e.ships[l] && (e.ships[l] = 0), 0 > planets[d].fleets[u].ships[l] && (planets[d].fleets[u].ships[l] = 0));
                            for (l = Q = 0; l < ships.length; l++) Q += e.ships[l];
                            l = e.value() + planets[d].fleets[u].value();
                            0 < l && (planets[d].fleets[u].exp = Math.floor(h * planets[d].fleets[u].value() / l), e.exp = Math.ceil(h * e.value() / l));
                            if (0 == Q && 0 != b[1] && "hub" != b[1]) planets[d].fleets[u].storage = planets[d].fleets[b[1]].storage, delete planets[d].fleets[b[1]];
                            else
                                for (e = planets[d].fleets[u].maxStorage() / g, planets[d].fleets[b[1]].maxStorage(), l = 0; l < resNum; l++) Q = parseInt(Math.floor(planets[d].fleets[b[1]].storage[l] * e)), planets[d].fleets[u].load(l, Q) && planets[d].fleets[b[1]].unloadSingle(l, Q)
                        }
                        M(currentCriteria);
                        document.getElementById("ship_info_name") &&
                            (document.getElementById("ship_info_name").innerHTML = "");
                        document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "")
                    }) : "autoDivide" == this.type && $("#popup_ok_button").click(function () {
                        var b = $("#autodiv_button").attr("name").split("_");
                        b = fleetSchedule.fleets[b[1]];
                        b.maxStorage();
                        for (var d = 0, e = 0, h = 0; h < ships.length; h++) $("#slide" + h).val() && (d += parseInt($("#slide" + h).val())), e += b.ships[h];
                        if (0 == e) b = new v(210, 0, "<span class='red_text red_text_shadow'>This fleet has no ship!</span>",
                            "info"), b.drawToast();
                        else if (0 == d) b = new v(210, 0, "<span class='red_text red_text_shadow'>You must select at least 1 ship!</span>", "info"), b.drawToast();
                        else if (d < e) {
                            d = new Fleet(game.id, "div - " + b.name);
                            for (h = 0; h < ships.length; h++) $("#slide" + h).val() && (e = parseInt($("#slide" + h).val()), d.ships[h] = e, b.ships[h] -= e, 0 > b.ships[h] && (b.ships[h] = 0), 0 > d.ships[h] && (d.ships[h] = 0));
                            d.maxStorage();
                            b.maxStorage();
                            if (b.usedStorage() > b.maxStorage()) {
                                var g = (b.usedStorage() - b.maxStorage()) / b.usedStorage();
                                for (h = 0; h < resNum; h++) e =
                                    parseInt(Math.floor(b.storage[h] * g)), d.load(h, e) && b.unloadSingle(h, e)
                            }
                            d.type = "normal";
                            d.move(b.source, b.destination)
                        } else b = new v(210, 0, "<span class='red_text red_text_shadow'>You can not leave the autoroute empty</span>", "info"), b.drawToast();
                        U(currentCriteriaAuto);
                        document.getElementById("ship_info_name") && (document.getElementById("ship_info_name").innerHTML = "");
                        document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "")
                    });
                    break;
                case "loadShip":
                    for (e = 0; e <
                        resNum; e++) $("#res_slide" + e).change(function () {
                        $("#res_textval" + $(this).attr("name")).val($(this).val())
                    }), $("#res_textval" + e).change(function () {
                        Number.isInteger(Math.floor(parseFloat($(this).val()))) ? Math.floor(parseFloat($(this).val())) > $("#res_slide" + $(this).attr("name")).attr("max") && $(this).val($("#res_slide" + $(this).attr("name")).attr("max")) : $(this).val(0);
                        $("#res_slide" + $(this).attr("name")).val($(this).val())
                    });
                    $("#popup_close_button").click(this.drop);
                    currentPopup = this;
                    $("#popup_ok_button").unbind();
                    $("#popup_ok_button").click(function () {
                        for (var b = currentFleetId.split("_"), d = b[0], e = planets[d].fleets[b[1]], h = 0, g = 0; g < resNum; g++) $("#res_slide" + g).val() && (h += Math.floor(parseFloat($("#res_slide" + g).val())));
                        if (h <= e.availableStorage()) {
                            for (g = 0; g < resNum; g++) $("#res_slide" + g).val() && (e = Math.floor(parseFloat($("#res_slide" + g).val())), planets[d].resources[g] >= e && (e = Math.min(e, planets[d].resources[g]), planets[d].fleets[b[1]].load(g, e) && planets[d].resourcesAdd(g, -e)));
                            M(currentCriteria);
                            document.getElementById("ship_info_name") &&
                                (document.getElementById("ship_info_name").innerHTML = "");
                            document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "");
                            currentPopup.drop();
                            b = new v(210, 0, "<span class='blue_text text_shadow'>Resources loaded!</span>", "info")
                        } else currentPopup.drop(), b = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough storage!</span>", "info");
                        b.drawToast()
                    });
                    break;
                case "renameFleet":
                    currentPopup = this;
                    $("#popup_close_button").unbind();
                    $("#popup_close_button").click(this.drop);
                    $("#popup_ok_button").unbind();
                    $("#popup_ok_button").click(function () {
                        var b = currentFleetId.split("_");
                        planets[b[0]].fleets[b[1]].name = String($("#rename_fleet").val()).replace(/[&<>"'\/]/g, function (b) {
                            return ""
                        });
                        currentPopup.drop();
                        M(currentCriteria);
                        (new v(210, 0, "<span class='blue_text text_shadow'>Fleet renamed!</span>", "info")).drawToast()
                    });
                    break;
                case "renameGame":
                    currentPopup = this;
                    $("#popup_close_button").unbind();
                    $("#popup_close_button").click(this.drop);
                    $("#popup_ok_button").unbind();
                    $("#popup_ok_button").click(function () {
                        game.name =
                            String($("#rename_fleet").val()).replace(/[&<>"'\/]/g, function (b) {
                                return ""
                            });
                        currentPopup.drop();
                        A(currentPlanet);
                        (new v(210, 0, "<span class='blue_text text_shadow'>Civilization renamed!</span>", "info")).drawToast()
                    });
                    break;
                case "renameFleetTravel":
                    currentPopup = this;
                    $("#popup_close_button").unbind();
                    $("#popup_close_button").click(this.drop);
                    $("#popup_ok_button").unbind();
                    $("#popup_ok_button").click(function () {
                        currentPopup.func.name = String($("#rename_fleet").val()).replace(/[&<>"'\/]/g, function (b) {
                            return ""
                        });
                        currentPopup.drop();
                        U("auto");
                        (new v(210, 0, "<span class='blue_text text_shadow'>Fleet renamed!</span>", "info")).drawToast()
                    });
                    break;
                case "confirm":
                    $("#popup_ok_button").click(this.func);
                    $("#popup_close_button").click(this.drop);
                    break;
                case "tutorial":
                    $("#popup_ok_button").click(this.func);
                    $("#popup_ok_button").click(this.drop);
                    $("#popup_ok_button").click(function () {
                        currentPopup = null
                    });
                    $("#popup_disable_tutorial").click(function () {
                        gameSettings.hideTutorial = !0;
                        tutorials[getAvailableTutorial()].drop();
                        currentPopup.drop()
                    });
                    break;
                default:
                    $("#popup_ok_button").click(this.drop)
            }
            $("#popup_info").hide();
            $("#popup").css("top", "" + parseInt(($(window).height() - d) / 2) + "px");
            $("#popup").css("left", "" + parseInt(($(window).width() - b) / 2) + "px");
            $("#popup_content").css("width", "" + b + "px");
            $("#line_top").css("width", "" + b + "px");
            $("#line_down").css("width", "" + b + "px");
            $("#popup_content").css("height", "" + (d + 12) + "px");
            $("#popup_content").mCustomScrollbar(O);
            "info" == this.type && ($("#popup_container").css("z-index", 0), $("#popup_container").css("background-color",
                "rgba(2, 4, 5, 0.0)"));
            "tutorial" == this.type && $("#popup_container").css("background-color", "rgba(2, 4, 5, 0.7)");
            $("#popup_container").show()
        };
        this.drawInfo = function () {
            currentPopup && currentPopup.drop();
            currentPopup = this;
            document.getElementById("popup_info_content") && (document.getElementById("popup_info_content").innerHTML = "<span style='float:left; text-align:center;'>" + this.content + "</span>");
            switch (this.type) {
                case "prompt":
                    this.promptValue = function () {
                        return $("#prompt_value").val()
                    };
                    $("#prompt_ok_button").click(function () {
                        currentPopup.func()
                    });
                    $("#prompt_cancel_button").click(this.drop);
                    break;
                case "buy":
                    $("#popup_ok_button").click(g);
                    $("#popup_leave_button").click(this.drop);
                    break;
                case "info":
                    break;
                default:
                    $("#popup_ok_button").click(this.drop)
            }
            $("#popup_info").css("top", "" + parseInt(($(window).height() - d) / 2) + "px");
            $("#popup_info").css("left", "" + parseInt(($(window).width() - b) / 2) + "px");
            $("#popup__info_content").css("width", "" + b + "px");
            $("#line_top_info").css("width", "" + b + "px");
            $("#line_down_info").css("width", "" + b + "px");
            $("#popup_info_content").css("height",
                "" + d + "px");
            $("#popup_info").show()
        };
        this.drawToast = function () {
            toastTimeout && clearTimeout(toastTimeout);
            currentToast && currentToast.dropToast();
            clearTimeout(toastTimeout);
            document.getElementById("popup_display_content_toast") && (document.getElementById("popup_display_content_toast").innerHTML = "<span style='float:left; text-align:center;'>" + this.content + "</span>");
            $("#popup_display_toast").css("left", "" + parseInt(($(window).width() - b) / 2) + "px");
            $("#popup_display_content_toast").css("width", "" + b + "px");
            $("#popup_display_content_toast").css("height",
                "" + d + "px");
            $("#popup_display_toast").show();
            currentToast = this;
            toastTimeout = setTimeout(function () {
                currentToast.dropToast()
            }, 3E3);
            $("#popup_container_toast").css("z-index", 100);
            $("#popup_container_toast").css("background-color", "rgba(2, 4, 5, 0.7)")
        };
        this.drop = function () {
            "info" != this.type ? $("#popup_container").hide() : ($("#popup_info").hide(), $("#popup_display").hide(), $("#popup_container").css("z-index", 100), $("#popup_container").css("background-color", "rgba(2, 4, 5, 0.7)"))
        };
        this.dropToast = function () {
            $("#popup_info_toast").hide();
            $("#popup_display_toast").hide();
            $("#popup_container_toast").css("z-index", 100);
            $("#popup_container_toast").css("background-color", "rgba(2, 4, 5, 0.7)");
            $("#popup_container_toast").hide()
        }
    }

    function y() {
        $("#story_interface").hide();
        $("#permanent_menu").hide();
        $("#planet_mini").hide();
        $("#planet_interface").hide();
        $("#diplomacy_interface").hide();
        $("#planet_building_interface").hide();
        $("#planet_selection_interface").hide();
        $("#research_interface").hide();
        $("#tech_interface").hide();
        $("#settings_interface").hide();
        $("#ship_interface").hide();
        $("#shipyard_interface").hide();
        $("#map_interface").hide();
        $("#map_selection_interface").hide();
        $("#nebula_name").hide();
        $("#quest_interface").hide();
        $("#market_interface").hide();
        $("#profile_interface").hide();
        $("#building_selection_interface").hide();
        $("#back_button").hide();
        $("#bottom_build_menu").hide()
    }

    function H() {
        currentInterface = "permanentMenu";
        currentUpdater = function () {};
        y();
        $("#permanent_menu").show();
        firston && (firston = !1)
    }

    function A(b) {
        currentPlanet = b;
        currentInterface =
            "planetInterface";
        currentUpdater = function () {};
        $("#planet_visualizer").attr("src", "img/" + b.icon + "/" + b.icon + ".png");
        for (var d = "", e = 0; e < b.places.length; e++) {
            var g = b.places[e];
            g.available() && (d += "<img id='place_" + g.id + "' name='" + g.id + "' src='ui/mark.png' style='cursor:pointer;width:32px;height:32px;position:absolute;left:" + (25 + 50 * g.position.x) + "%;top:" + (10 + 80 * g.position.y) + "%;' />")
        }
        $("#planet_places").html(d);
        for (e = 0; e < b.places.length; e++) g = b.places[e], g.available() && ($("#place_" + g.id).unbind(), h("place_" +
            g.id, "<span class='blue_text'>Investigate " + g.name + "</span>", 232), $("#place_" + g.id).click(function () {
            var b = $(this).attr("name");
            b = places[placesNames[b]];
            console.log(b.description);
            b.action();
            $(this).unbind();
            $(this).hide();
            (new v(210, 96, "<br><span class='white_text'>" + b.description() + "</span>", "Ok")).draw()
        }));
        game.searchPlanet(b.id) && 1 < game.planets.length ? ($("#arrow_left").unbind(), $("#arrow_left").click(function () {
            for (var b = !1, d = 0; !b && d < game.planets.length;) game.planets[d] == currentPlanet.id ? b = !0 :
                d++;
            b && A(planets[game.planets[(d + game.planets.length - 1) % game.planets.length]])
        }), $("#arrow_right").unbind(), $("#arrow_right").click(function () {
            for (var b = !1, d = 0; !b && d < game.planets.length;) game.planets[d] == currentPlanet.id ? b = !0 : d++;
            b && A(planets[game.planets[(d + 1) % game.planets.length]])
        }), $("#arrow_left").show(), $("#arrow_right").show()) : ($("#arrow_left").unbind(), $("#arrow_left").hide(), $("#arrow_right").unbind(), $("#arrow_right").hide());
        null != b.civis ? (e = "<span class='white_text' style='font-size:100%;'>Controlled by </span><span  id='civ_name' name='" +
            b.civis + "' style='cursor:pointer'>" + civis[b.civis].name + "</span>", document.getElementById("civis_name") && (document.getElementById("civis_name").innerHTML = e), b.civis && $("#civ_name").click(function () {
                0 < game.timeTravelNum && fa(b.civis)
            }), b.civis == game.id && $("#game_rename").click(function () {
                (new v(360, 140, "<br><span class='blue_text text_shadow'>Type the new name</span><br>", "renameGame")).draw()
            })) : document.getElementById("civis_name") && (document.getElementById("civis_name").innerHTML = "");
        e = "";
        var u;
        game.searchPlanet(b.id) ? u = "blue_text" : null == b.civis ? u = "white_text" : null != b.civis && (u = "red_text");
        b.id == game.capital ? (e += "<span class='blue_text' style='position:absolute; font-size:120%; float:left; width:200px; text-align:center; top:8px; color: rgb(240,180,20);'>" + b.name + "</span>", e += "<br><span class='blue_text' style='position:absolute; font-size: 80%; float:left; width:200px; text-align:center; top: 32px; color: rgb(240,180,20);'>(Capital)</span>") : e += "<span class='" + u + "' style='position:absolute; font-size:120%; float:left; width:200px; text-align:center; top:8px;'>" +
            b.name + "</span>";
        e = e + "<ul id='info_list' style='position:absolute; text-align:left; top:48px; margin-top:16px; clear:both;'>" + uiScheduler.planetInfo(b);
        e += "<br><br>";
        if (game.searchPlanet(b.id)) {
            var l = new z("action_b", "Buildings", 240, 40, I);
            e += l.getHtml();
            var m = new z("action_auto", "Autoroutes", 240, 40, function () {
                U(b.id)
            });
            e += m.getHtml();
            var w = new z("action_sendqueue", "Send resources for queue", 240, 40, function () {
                b.queue[0] && resourceRequest(b)
            });
            if (4 <= game.planets.length || 0 < game.timeTravelNum) e += w.getHtml()
        } else null ==
            b.civis ? currentPlanetClicker = function () {
                S(nebulas[b.map])
            } : null != b.civis && (currentPlanetClicker = function () {
                S(nebulas[b.map])
            });
        if (b.id == tournamentPlanet) {
            var T = new z("action_tournament", "<span class='red_text' style='font-size:110%'>Space Tournament", 240, 40, function () {
                ha()
            });
            e += T.getHtml()
        }
        e += "</ul>";
        document.getElementById("info_list") && (document.getElementById("info_list").innerHTML = e);
        l && l.enable();
        m && m.enable();
        w && w.enable();
        T && T.enable();
        u = "";
        game.searchPlanet(b.id) ? u += "<span class='blue_text' style='position:absolute; font-size:120%; float:left; width:200px; text-align:center; top:8px;'>Status</span>" :
            b.unlock && (e = researchesName[b.unlock], u = u + "<br><span class='green_text' style='font-size:100%; float:left; width:200px; text-align:center; top:8px;'>This planet unlocks: </span><br><br>" + ("<span class='blue_text' style='font-size: 100%;'>" + game.researches[e].name + " Research</span><br><br>"), u += "<span class='white_text'>" + game.researches[e].description() + "</span><li>");
        u = u + "<ul id='info_list2' style='position:absolute; text-align:left; top:48px; margin-top:16px; clear:both;'>" + uiScheduler.planetResources(b);
        u += "</ul>";
        document.getElementById("info_list2") && (document.getElementById("info_list2").innerHTML = u);
        $("#building_icon").hide();
        game.searchPlanet(b.id) && (currentPlanet = b, $("#building_icon").click(function () {
            I()
        }), $("#building_icon").show(), $("#action_b").click(function () {
            I()
        }));
        game.searchPlanet(b.id) && (currentUpdater = function () {
            var d = "<span class='blue_text' style='position:absolute; font-size:120%; float:left; width:200px; text-align:center; top:8px;'>Status</span><ul id='info_list2' style='position:absolute; text-align:left; top:48px; margin-top:16px; clear:both;'>" +
                uiScheduler.planetResourcesUpdater([b]);
            d += "</ul>";
            document.getElementById("info_list2") && (document.getElementById("info_list2").innerHTML = d);
            uiScheduler.planetInfoUpdater([b])
        });
        y();
        $("#planet_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(ia);
        $("#back_button").show();
        game.searchPlanet(b.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level ? $("#b_shipyard_icon").show() : $("#b_shipyard_icon").hide(),
            $("#b_market_icon").hide()))
    }

    function I() {
        currentInterface = "buildingSelectionInterface";
        y();
        $("#building_selection_planet_icon").attr("src", "img/" + currentPlanet.icon + "/" + currentPlanet.icon + ".png");
        $("#building_selection_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(function () {
            A(currentPlanet)
        });
        $("#back_button").show();
        $("#bottom_build_menu").show();
        5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(),
            $("#b_market_icon").hide())
    }

    function B(b, d) {
        currentInterface = "planetBuildingInterface_" + b;
        currentPlanet = d;
        currentUpdater = function () {};
        for (var e = "", h = 0; h < game.buildings.length; h++)
            if (game.buildings[h].type == b) {
                var g = "button";
                g = currentPlanet.structureAffordable(h) ? "button" : "red_button";
                var u = !1;
                if ("mining" == b)
                    for (var N = 0; N < resNum; N++) {
                        if (0 < game.buildings[h].resourcesProd[N] * currentPlanet.baseResources[N]) {
                            u = !0;
                            break
                        }
                    } else u = !0;
                game.buildings[h].show(currentPlanet) && u && (e += "<li id='building" + h + "' name='" +
                    h + "' style='height:80px;' class='" + g + "'></li>")
            }
        e += "<li id='building_empty' style='height:80px;'></li>";
        document.getElementById("building_list") && (document.getElementById("building_list").innerHTML = e);
        e = "<ul id='mini_list' style='position:absolute; text-align:left; top:0px; clear:both;'><div style='position:relative; left:8px;'>" + ("<span class='blue_text'>Energy Prod.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(d.energyProduction()) + "</span><br>");
        e += "<span class='blue_text'>Energy Cons.: </span><span class='white_text' style='float:right;margin-right:20%;'>" +
            Math.floor(-d.energyConsumption()) + "</span><br>";
        h = Math.floor(d.energyProduction() + d.energyConsumption());
        g = d.energyMalus();
        1 < g ? g = 1 : 0 > g && (g = 0);
        u = "green_text";.85 <= g && 1 > g ? u = "gold_text" : .85 > g && (u = "red_text");
        e += "<span class='blue_text'>Balance: </span><span class='" + u + "' style='float:right;margin-right:20%;'>" + parseInt(Math.floor(h)) + "</span><br>";
        e += "<span class='blue_text'>Efficiency: </span><span class='" + u + "' style='float:right;margin-right:20%;'>" + Math.floor(1E4 * g) / 100 + "%</span><br><br>";
        gameSettings.populationEnabled &&
            (e += "<span class='blue_text'>Population Growth: </span><span id='popGrow' class='white_text' style='float:right;margin-right:20%;'>" + 100 * d.basePopulation + "%" + (0 < d.structure[buildingsName.clonation].number ? "<span class='green_text'>(+" + d.structure[buildingsName.clonation].number + "%)</span>" : "") + "/y</span><br>", e += "<span class='blue_text'>Population: </span><span class='white_text' style='float:right;margin-right:20%;' id='popul'>" + beauty(d.population) + " " + (0 < d.globalProd.population + d.populationRatio ?
                "<span class='green_text'>(+" + beauty(d.globalProd.population + d.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(d.globalProd.population + d.populationRatio) + "/s)</span>") + "</span><br>", e += "<span class='blue_text'>Habitable Space: </span><span class='white_text' style='float:right;margin-right:20%;' id='habitable'>" + beauty(d.habitableSpace()) + "</span><br><br>");
        e += uiScheduler.planetResources(d);
        e += "</div></ul>";
        document.getElementById("mini_list") && (document.getElementById("mini_list").innerHTML =
            e);
        for (h = 0; h < game.buildings.length; h++)
            if (game.buildings[h].type == b) {
                u = !1;
                if ("mining" == b)
                    for (N = 0; N < resNum; N++) {
                        if (0 < game.buildings[h].resourcesProd[N]) {
                            u = !0;
                            break
                        }
                    } else u = !0;
                game.buildings[h].show(currentPlanet) && u && ($("#building" + h).unbind(), $("#building" + h).valore = h, $("#building" + h).click(function () {
                    var b = game.buildings[parseInt($(this).attr("name"))],
                        d = "<span class='green_text'>(Active)</span>";
                    currentPlanet.structure[b.id].active || (d = "<span class='red_text'>(Not Active)</span>");
                    document.getElementById("building_info_name") &&
                        (document.getElementById("building_info_name").innerHTML = game.buildings[parseInt($(this).attr("name"))].displayName + "<br>" + d);
                    d = "<ul id='building_info_list' style='position:absolute; text-align:right; top:48px; margin-top:16px; clear:both;'><div style='position:relative; left:8px;'>";
                    b.description && (d += "<span class='gold_text' style='float:left;margin-left:16px;font-size:80%;'>" + b.description + "</span><br><br>");
                    d += "<div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Production</span><br><br>";
                    var e = game.buildings[parseInt($(this).attr("name"))].rawProduction(currentPlanet),
                        h = game.buildings[parseInt($(this).attr("name"))].production(currentPlanet);
                    0 < b.habitableSpace ? d += "<span class='blue_text' style='float:left;margin-left:16px;'>Habitable Space: </span><span class='green_text'>" + beauty(b.habitableSpace) + "</span><br><br>" : 0 > b.habitableSpace && (d += "<span class='blue_text' style='float:left;margin-left:16px;'>Habitable Space: </span><span class='red_text'>" + beauty(b.habitableSpace) + "</span><br><br>");
                    "clonation" == b.name && (d += "<span class='blue_text' style='float:left;margin-left:16px;'>Population Growth: </span><span class='white_text'>+1% (+" + currentPlanet.structure[b.id].number + "% total)</span><br><br>");
                    for (var g = 0; g < resNum; g++) 0 != b.resourcesProd[g] && (0 < b.resourcesProd[g] && (0 < currentPlanet.baseResources[g] || "mine" != b.type2) ? d += "<span class='blue_text' style='float:left;margin-left:16px;'>" + resources[g].name.capitalize() + ": </span><span class='green_text'>" + beauty(e[g]) + "/s (" + beauty(h[g]) +
                        "/s tot)</span><br>" : 0 > b.resourcesProd[g] && (d += "<span class='blue_text' style='float:left;margin-left:16px;'>" + resources[g].name.capitalize() + ": </span><span class='red_text'>" + beauty(e[g]) + "/s (" + beauty(h[g]) + "/s tot)</span><br>"));
                    0 != b.energy && (e = "red_text", 0 < b.energy && (e = "green_text"), d = "solar" == b.type2 ? d + ("<span class='blue_text' style='float:left;margin-left:16px;'>Energy: </span><span class='" + e + "'>" + beauty(b.energy / (currentPlanet.info.orbit * currentPlanet.info.orbit)) + "/s (" + beauty(h.energy) +
                        "/s tot)</span><br>") : d + ("<span class='blue_text' style='float:left;margin-left:16px;'>Energy: </span><span class='" + e + "'>" + beauty(b.energy) + "/s (" + beauty(h.energy) + "/s tot)</span><br>"));
                    0 != b.population && (e = "red_text", 0 < currentPlanet.basePopulation * b.population && (e = "green_text"), d += "<span class='blue_text' style='float:left;margin-left:16px;'>Population: </span><span class='" + e + "'>" + beauty(b.population) + "/s (" + beauty(currentPlanet.structure[parseInt($(this).attr("name"))].number * b.population) + "/s tot)</span><br>");
                    0 != b.pollution && (e = "red_text", 0 > b.pollution && (e = "green_text"));
                    0 != b.researchPoint && (e = "red_text", 0 < b.researchPoint && (e = "green_text"), d = "cryolab" == b.name ? d + ("<span class='blue_text' style='float:left;margin-left:16px;'>Research points: </span><span class='" + e + "'>" + beauty(b.researchPoint * currentPlanet.info.temp * -5) + "/s<br>(" + beauty(currentPlanet.structure[parseInt($(this).attr("name"))].number * b.researchPoint * currentPlanet.info.temp * -5) + "/s tot)</span><br>") : "lavaresearch" == b.name ? d + ("<span class='blue_text' style='float:left;margin-left:16px;'>Research points: </span><span class='" +
                        e + "'>" + beauty(b.researchPoint * currentPlanet.info.temp) + "/s<br>(" + beauty(currentPlanet.structure[parseInt($(this).attr("name"))].number * b.researchPoint * currentPlanet.info.temp) + "/s tot)</span><br>") : d + ("<span class='blue_text' style='float:left;margin-left:16px;'>Research points: </span><span class='" + e + "'>" + beauty(b.researchPoint) + "/s<br>(" + beauty(currentPlanet.structure[parseInt($(this).attr("name"))].number * b.researchPoint) + "/s tot)</span><br>"));
                    d += "</div><br><div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Cost</span><br><br>";
                    for (b = 0; b < resNum; b++) h = currentPlanet.structure[parseInt($(this).attr("name"))].cost(b), e = "blue_text", g = "white_text", h > currentPlanet.resources[b] && (g = e = "red_text"), 0 < h && (d += "<span class='" + e + "' style='float:left;margin-left:16px;'>" + resources[b].name.capitalize() + ": </span>", d += "<span class='" + g + "'>" + beauty(h), gameSettings.showMultipliers && (d += " (x" + game.buildings[parseInt($(this).attr("name"))].resourcesMult[b] + ")"), d += "</span><br>");
                    d += "</div><br><br>";
                    b = !1;
                    "time_machine" == buildings[parseInt($(this).attr("name"))].name &&
                        0 < currentPlanet.structure[parseInt($(this).attr("name"))].number ? (b = new z("time_button", "Travel in Time", 224, 40, function () {
                            var b = game.totalTPspent() + 2 * game.influence() * Math.log(1 + game.totalRPspent() / (200 * bi)) / Math.log(5);
                            (new v(210, 200, "<br><span class='blue_text'>Are you sure you want to travel in time? </span><br><span class='red_text'>You will lose all your planets, resources and fleets!</span><br><span class='blue_text'>After traveling in time you will get <span class='green_text'>" + beauty(b) +
                                " Technology Points</span> to reassign them on researches.</span>", "confirm",
                                function () {
                                    prestige();
                                    currentPopup.drop()
                                })).draw()
                        }), d += b.getHtml()) : "space_machine" == buildings[parseInt($(this).attr("name"))].name && 0 < currentPlanet.structure[parseInt($(this).attr("name"))].number && (b = new z("space_button", "Send a Fleet to Solidad<br><span class='red_text'>No way back!</span><br><span class='white_text'>(" + beauty(1E5 * Math.sqrt(currentPlanet.structure[parseInt($(this).attr("name"))].number)) + " weight per antimatter)</span>",
                            224, 40,
                            function () {
                                (new v(210, 0, "<span class='blue_text text_shadow'>Select the Fleet you wish to send through the gate</span>", "info")).drawToast();
                                var b = currentPlanet.id;
                                M({
                                    t: "all",
                                    p: b
                                });
                                for (var d in planets[b].fleets) 0 < planets[b].fleets[d].shipNum() && ($("#fleet" + b + "_" + d).unbind(), $("#fleet" + b + "_" + d).click(function () {
                                    var b = $(this).attr("name").split("_"),
                                        d = b[0],
                                        e = planets[d].fleets[b[1]],
                                        h = Math.ceil(e.totalWeight() / (1E5 * Math.sqrt(planets[d].structure[buildingsName.space_machine].number)));
                                    planets[d].resources[resourcesName.antimatter.id] >=
                                        h ? (planets[planetsName.solidad].fleetPush(e), delete planets[d].fleets[b[1]], planets[d].resources[resourcesName.antimatter.id] -= h, 0 > planets[d].resources[resourcesName.antimatter.id] && (planets[d].resources[resourcesName.antimatter.id] = 0), B("other", planets[d]), b = new v(210, 0, "<span class='blue_text'>Fleet moved to Solidad</span>", "info")) : (B("other", planets[d]), b = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough antimatter to move this fleet</span>", "info"));
                                    b.drawToast()
                                }), $("#fleet" + b +
                                    "_" + d).hover(function () {
                                    var b = $(this).attr("name").split("_"),
                                        d = b[0];
                                    b = planets[d].fleets[b[1]];
                                    (new v(240, 10, "<span class='blue_text'>Total weight: </span><span class='white_text'>" + beauty(b.totalWeight()) + "</span><br><span class='blue_text'>Antimatter cost: </span><span class='white_text'>" + beauty(Math.ceil(b.totalWeight() / (1E5 * Math.sqrt(planets[d].structure[buildingsName.space_machine].number)))) + "</span>", "info")).drawInfo();
                                    $(document).on("mousemove", function (b) {
                                        mouseX = b.pageX + 10;
                                        mouseY = b.pageY +
                                            10;
                                        $("#popup_info").css({
                                            left: mouseX,
                                            top: mouseY
                                        })
                                    });
                                    $("#popup_info").css({
                                        left: mouseX,
                                        top: mouseY
                                    })
                                }, function () {
                                    currentPopup.drop()
                                }), $("#fleet" + b + "_" + d).mouseout(function () {
                                    $(document).on("mousemove", function () {})
                                }))
                            }), d += b.getHtml());
                    d += "</ul>";
                    document.getElementById("building_info_list") && (document.getElementById("building_info_list").innerHTML = d);
                    currentBuildingId = parseInt($(this).attr("name"));
                    b && b.enable();
                    m()
                }), gameSettings.showBuildingAid && $("#building" + h).hover(function () {
                        for (var b = $(this).attr("name"),
                                d = 0; d < resNum; d++) 1 <= currentPlanet.structure[b].cost(d) && (highlightRes[d] = !0, $("#res_name_div_" + d).css("background", "rgba(75,129,156,0.3)"), $("#buildingAid_" + d).html("")), 0 < buildings[b].resourcesProd[d] ? (highlightProd[d] = !0, $("#res_name_div_" + d).css("background", "rgba(0,255,0,0.3)"), $("#buildingAid_" + d).html("<img src='ui/arrow_up_green.png' />")) : 0 > buildings[b].resourcesProd[d] && (highlightCons[d] = !0, $("#res_name_div_" + d).css("background", "rgba(255,0,0,0.3)"), $("#buildingAid_" + d).html("<img src='ui/arrow_down_red.png' />"))
                    },
                    function () {
                        for (var b = $(this).attr("name"), d = 0; d < resNum; d++) 1 <= currentPlanet.structure[b].cost(d) && (highlightRes[d] = !1, $("#res_name_div_" + d).css("background", "rgba(75,129,156,0.0)"), $("#buildingAid_" + d).html("")), 0 < buildings[b].resourcesProd[d] ? (highlightProd[d] = !1, $("#res_name_div_" + d).css("background", "rgba(0,255,0,0.0)"), $("#buildingAid_" + d).html("")) : 0 > buildings[b].resourcesProd[d] && (highlightCons[d] = !1, $("#res_name_div_" + d).css("background", "rgba(255,0,0,0.0)"), $("#buildingAid_" + d).html(""))
                    }))
            }
        l();
        currentUpdater = function () {
            var b = "<ul id='mini_list' style='position:absolute; text-align:left; top:0px;clear:both;'><div style='position:relative; left:8px;'>" + ("<span class='blue_text'>Energy Prod.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(d.energyProduction()) + "</span><br>");
            b += "<span class='blue_text'>Energy Cons.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(-d.energyConsumption()) + "</span><br>";
            var e = Math.floor(d.energyProduction() +
                    d.energyConsumption()),
                h = d.energyMalus();
            1 < h ? h = 1 : 0 > h && (h = 0);
            var g = "green_text";.85 <= h && 1 > h ? g = "gold_text" : .85 > h && (g = "red_text");
            b += "<span class='blue_text'>Balance: </span><span class='" + g + "' style='float:right;margin-right:20%;'>" + parseInt(Math.floor(e)) + "</span><br>";
            b += "<span class='blue_text'>Efficiency: </span><span class='" + g + "' style='float:right;margin-right:20%;'>" + Math.floor(1E4 * h) / 100 + "%</span><br><br>";
            gameSettings.populationEnabled && (b += "<span class='blue_text'>Population Growth: </span><span id='popGrow' class='white_text' style='float:right;margin-right:20%;'>" +
                100 * d.basePopulation + "%" + (0 < d.structure[buildingsName.clonation].number ? "<span class='green_text'>(+" + d.structure[buildingsName.clonation].number + "%)</span>" : "") + "/y</span><br>", b += "<span class='blue_text'>Population: </span><span class='white_text' style='float:right;margin-right:20%;' id='popul'>" + beauty(d.population) + " " + (0 < d.globalProd.population + d.populationRatio ? "<span class='green_text'>(+" + beauty(d.globalProd.population + d.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(d.globalProd.population +
                    d.populationRatio) + "/s)</span>") + "</span><br>", b += "<span class='blue_text'>Habitable Space: </span><span class='white_text' style='float:right;margin-right:20%;' id='habitable'>" + beauty(d.habitableSpace()) + "</span><br><br>");
            b = b + "<div style='position:relative; left:-8px;'>" + uiScheduler.planetResources(d);
            b += "</div></div></ul>";
            document.getElementById("mini_list") && (document.getElementById("mini_list").innerHTML = b);
            m()
        };
        currentUpdater();
        y();
        x();
        $("#arrow_mini_left").unbind();
        $("#arrow_mini_left").click(function () {
            for (var d = !1, e = 0; !d && e < game.planets.length;) game.planets[e] == currentPlanet.id ? d = !0 : e++;
            d && B(b, planets[game.planets[(e + game.planets.length - 1) % game.planets.length]])
        });
        $("#arrow_mini_right").unbind();
        $("#arrow_mini_right").click(function () {
            for (var d = !1, e = 0; !d && e < game.planets.length;) game.planets[e] == currentPlanet.id ? d = !0 : e++;
            d && B(b, planets[game.planets[(e + 1) % game.planets.length]])
        });
        1 < game.planets.length ? ($("#arrow_mini_left").show(), $("#arrow_mini_right").show()) : ($("#arrow_mini_left").hide(), $("#arrow_mini_right").hide());
        $("#planet_building_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(I);
        $("#back_button").show();
        game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(), $("#b_market_icon").hide()))
    }

    function n(b) {
        currentInterface = "shipyardInterface";
        currentPlanet = b;
        currentUpdater = function () {};
        for (var d = [], e = "", g = 0; g < game.ships.length; g++) {
            var u =
                "button";
            u = currentPlanet.shipAffordable(game.ships[g].id) ? "button" : "red_button";
            game.ships[g].req <= currentPlanet.structure[buildingsName.shipyard].number && game.ships[g].show() ? e += "<li id='shipyard" + g + "' name='" + game.ships[g].id + "' style='height:80px;' class='" + u + "'></li>" : game.ships[g].req <= currentPlanet.structure[buildingsName.shipyard].number + 1 && (e += "<li id='shipyard_locked" + g + "' name='" + game.ships[g].id + "' style='height:80px;' class='red_button'></li>");
            d[g] = game.ships[g].id
        }
        document.getElementById("shipyard_list") &&
            (document.getElementById("shipyard_list").innerHTML = e);
        e = "<ul id='shipyard_mini_list' style='position:absolute; text-align:left; top:0px;clear:both;'><div style='position:relative; left:8px;'>" + ("<span class='blue_text' style='position:relative;top:-16px;'>Shipyard: </span><span class='white_text' style='float:right;margin-right:20%;position:relative;top:-26px;'><img id='shipyard_build' name='" + g + "' src='ui/add2.png' style='width:17px;height:17px;position:relative;top:4px;left:-2px;cursor:pointer;'/><span id='shipyard_level'>" +
            b.structure[buildingsName.shipyard].number + " </span><img id='shipyard_dismantle' src='ui/x.png' style='width:20px;height:20px;position:relative;top:6px;left:2px;cursor:pointer;'/></span><br><br>");
        e += "<span class='blue_text'>Energy Prod.: </span><span id='energy_prod' class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(b.energyProduction()) + "</span><br>";
        e += "<span class='blue_text'>Energy Cons.: </span><span id='energy_cons' class='white_text' style='float:right;margin-right:20%;'>" +
            Math.floor(-b.energyConsumption()) + "</span><br>";
        g = Math.floor(b.energyProduction() + b.energyConsumption());
        u = b.energyMalus();
        1 < u ? u = 1 : 0 > u && (u = 0);
        var l = "green_text";.85 <= u && 1 > u ? l = "gold_text" : .85 > u && (l = "red_text");
        e += "<span class='blue_text'>Balance: </span><span id='balance' class='" + l + "' style='float:right;margin-right:20%;'>" + parseInt(Math.floor(g)) + "</span><br>";
        e += "<span class='blue_text'>Efficiency: </span><span id='efficiency' class='" + l + "' style='float:right;margin-right:20%;'>" + Math.floor(1E4 *
            u) / 100 + "%</span><br><br>";
        gameSettings.populationEnabled && (e += "<span class='blue_text'>Population Growth: </span><span id='popGrow' class='white_text' style='float:right;margin-right:20%;'>" + 100 * b.basePopulation + "%" + (0 < b.structure[buildingsName.clonation].number ? "<span class='green_text'>(+" + b.structure[buildingsName.clonation].number + "%)</span>" : "") + "/y</span><br>", e += "<span class='blue_text'>Population: </span><span class='white_text' style='float:right;margin-right:20%;' id='popul'>" + beauty(b.population) +
            " " + (0 < b.globalProd.population + b.populationRatio ? "<span class='green_text'>(+" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>") + "</span><br>", e += "<span class='blue_text'>Habitable Space: </span><span class='white_text' style='float:right;margin-right:20%;' id='habitable'>" + beauty(b.habitableSpace()) + "</span><br><br>");
        u = b.rawProduction();
        l = Array(resNum);
        b.importExport();
        for (g = 0; g < resNum; g++) l[g] =
            b.globalImport[g] - b.globalExport[g];
        for (g = 0; g < resNum; g++)
            if ((resources[g].show(game) || 0 < b.resources[g]) && (resources[g].ship || gameSettings.allShipres)) {
                e += "<div id='res_name_div_" + g + "' ";
                var m = "<span id='buildingAid_" + g + "'>";
                highlightProd[g] ? (e += " style='background:rgba(0,255,0,0.3);'>", m += "<img src='ui/arrow_up_green.png' />") : highlightCons[g] ? (e += " style='background:rgba(255,0,0,0.3);'>", m += "<img src='ui/arrow_down_red.png' />") : e = highlightRes[g] ? e + " style='background:rgba(75,129,156,0.3);'>" : e +
                    ">";
                m += "</span>";
                e += "<span class='blue_text' >" + resources[g].name.capitalize() + ": </span><span class='white_text' style='margin-righ:16px;font-size:80%' id='res_name_prod_" + g + "' name='" + g + "'>" + beauty(b.resources[g]) + " <span class='" + (0 <= u[g] ? 0 < u[g] ? "green_text" : "gray_text" : "red_text oblique_txt") + "'>(" + (0 < u[g] ? "+" : "") + "" + beauty(u[g]) + "/s)" + m + "</span>";
                0 != l[g] && (e += "<span class='" + (0 <= l[g] ? 0 < l[g] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < l[g] ? "+" : "") + "" + beauty(l[g]) + "/s)</span>");
                gameSettings.populationEnabled && g == resourcesName.biomass.id && 0 < (b.population - b.sustainable()) / 5E3 && (e += "<span class='gold_text' id='res_name_prod_biomass' name='" + g + "'>(-" + beauty((b.population - b.sustainable()) / 5E3) + "/s)</span>");
                e += "</span></div>"
            }
        e += "</div></ul>";
        document.getElementById("shipyard_mini_list") && (document.getElementById("shipyard_mini_list").innerHTML = e);
        currentPlanet.shipyardFleet = new Fleet(game.id, "Fleet Y" + Math.floor(game.days / 365) + "-D" + Math.floor(game.days % 365));
        currentPlanet.shipyardFleet.pushed = !1;
        for (g = 0; g < d.length; g++) game.ships[g].req <= currentPlanet.structure[buildingsName.shipyard].number && game.ships[g].show() && ($("#shipyard" + g).valore = g, $("#shipyard" + g).click(function () {
            document.getElementById("shipyard_info_name") && (document.getElementById("shipyard_info_name").innerHTML = ships[parseInt($(this).attr("name"))].name);
            $("#shipyard_info_name").html(ships[parseInt($(this).attr("name"))].name);
            var b = "<ul id='shipyard_info_list' style='position:absolute; text-align:right; top:48px; margin-top:16px; clear:both;'>",
                d = ships[parseInt($(this).attr("name"))];
            d.icon && (b += "<img src='img/ships/" + d.icon + ".png' style='margin-left:16px;width:256px;height:256px' />");
            b = b + "<div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Information</span><br><br>" + ("<span class='blue_text' style='float:left;margin-left:16px;'>Type: </span><span class='white_text'>" + d.type + "</span><br>");
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='hp_info'>HP: </span><span class='white_text'>" +
                beauty(Math.floor(d.hp)) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='power_info'>Power: </span><span class='white_text'>" + beauty(Math.floor(100 * d.power) / 100) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='weapon_info'>Weapon: </span><span class='white_text'>" + d.weapon.capitalize() + "</span><br>";
            0 < d.piercing && (b += "<span class='blue_text' style='float:left;margin-left:16px;' id='piercing_info'>Piercing Power: </span><span class='white_text'>" +
                Math.min(100, d.piercing) + "%</span><br>");
            0 < d.shield && (b += "<span class='blue_text' style='float:left;margin-left:16px;' id='shields_info'>Shields: </span><span class='white_text'>" + beauty(d.shield) + "</span><br>");
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='armor_info'>Armor: </span><span class='white_text'>" + beauty(Math.floor(100 * d.armor) / 100) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='dr_info'>Damage Reduction: </span><span class='white_text'>" +
                Math.floor(100 * (100 - 100 / (1 + Math.log(1 + d.armor / 1E4) / Math.log(2)))) / 100 + "%</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='speed_info'>Speed: </span><span class='white_text'>" + Math.floor(100 * d.speed) / 100 + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='weight_info'>Weight: </span><span class='white_text'>" + beauty(d.weight) + "</span><br>";
            b += "<span class='blue_text' style='float:left;margin-left:16px;' id='storage_info'>Storage: </span><span class='white_text'>" +
                beauty(d.maxStorage) + "</span><br>";
            d.fuel && d.fuel.capitalize();
            b += "</div><br>";
            d.special && (b = b + "<div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Special Effects</span><br><br>" + d.special.desc, b += "<br></div><br>");
            b += "<div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Cost</span><br><br>";
            for (d = 0; d < resNum; d++) {
                var e = ships[parseInt($(this).attr("name"))].cost[d],
                    g =
                    "blue_text",
                    u = "white_text";
                e > currentPlanet.resources[d] && (u = g = "red_text");
                0 < e && (b += "<span class='" + g + "' style='float:left;margin-left:16px;'>" + resources[d].name.capitalize() + ": </span><span class='" + u + "'>" + beauty(e) + "</span><br>")
            }
            g = "blue_text";
            u = "white_text";
            ships[parseInt($(this).attr("name"))].population > currentPlanet.population && (u = g = "red_text");
            0 < ships[parseInt($(this).attr("name"))].population && (b += "<span class='" + g + "' style='float:left;margin-left:16px;'>Population: </span><span class='" + u +
                "'>" + beauty(ships[parseInt($(this).attr("name"))].population) + "</span><br>");
            b += "</div><br><br></ul>";
            document.getElementById("shipyard_info_list") && (document.getElementById("shipyard_info_list").innerHTML = b);
            $("#shipyard_info_list").html(b);
            currentShipId = parseInt($(this).attr("name"));
            h("hp_info", "<span class='white_text'>HPs are the amount of damage the<br>ship can sustain before<br>being destroyed</span>", 240);
            h("power_info", "<span class='white_text'>Power is the amount of RAW damage<br>the ship can do. It can<br>be boosted by equipping </span><span class='blue_text'>Ammunitions</span>",
                240);
            h("piercing_info", "<span class='white_text'>Piercing power is the amount of<br>damage reduction ignored while<br>damaging an enemy ship</span>", 240);
            h("shields_info", "<span class='white_text'>Shields power is the amount of<br>incoming damage that gets<br>totally blocked</span>", 240);
            h("armor_info", "<span class='white_text'>Armor reduces incoming damage.<br>It can be boosted by equipping </span><span class='blue_text'>Armor</span>", 240);
            h("dr_info", "<span class='white_text'>Damage reduction is the percentage<br>of enemy damage absorbed by the<br>armor.</span>",
                240);
            h("speed_info", "<span class='white_text'>Speed affects the travelling time of<br>a ship. It also increases power<br>if it is higher than enemy speed,<br>or decreases power if it is lower<br>than the enemy speed.<br>It can be boosted by equipping </span><span class='blue_text'>Engines</span></span>", 240);
            h("weight_info", "<span class='white_text'>Weight affects the power's<br>bonus/malus given by speed. Also,<br>enemies focus damage on higher weight<br>targets</span>", 240);
            h("storage_info", "<span class='white_text'>Storage is the amount of<br>resources that a ship can carry</span>",
                240)
        }));
        $("#shipyard_dismantle").unbind();
        $("#shipyard_dismantle").click(function () {
            currentPlanet.sellMultipleStructure(buildingsName.shipyard, 1) || (new v(210, 0, "<span class='red_text'>There are no buildings to dismantle!</span>", "info")).drawToast();
            n(currentPlanet)
        });
        $("#shipyard_build").unbind();
        $("#shipyard_build").click(function () {
            currentPlanet.buyMultipleStructure(buildingsName.shipyard, 1) || (new v(210, 0, "<span class='red_text'>There are not enough resources!</span>", "info")).drawToast();
            n(currentPlanet)
        });
        h("shipyard_build", currentPlanet.showBuyCost(buildingsName.shipyard, 1));
        h("shipyard_dismantle", currentPlanet.showSellCost(buildingsName.shipyard, 1));
        $("#shipyard_arrow_mini_left").unbind();
        $("#shipyard_arrow_mini_left").click(function () {
            for (var b = !1, d = 0; !b && d < game.planets.length;) game.planets[d] == currentPlanet.id ? b = !0 : d++;
            b && n(planets[game.planets[(d + game.planets.length - 1) % game.planets.length]])
        });
        $("#shipyard_arrow_mini_right").unbind();
        $("#shipyard_arrow_mini_right").click(function () {
            for (var b = !1, d = 0; !b && d < game.planets.length;) game.planets[d] == currentPlanet.id ? b = !0 : d++;
            b && n(planets[game.planets[(d + 1) % game.planets.length]])
        });
        1 < game.planets.length ? ($("#shipyard_arrow_mini_left").show(), $("#shipyard_arrow_mini_right").show()) : ($("#shipyard_arrow_mini_left").hide(), $("#shipyard_arrow_mini_right").hide());
        t();
        currentUpdater = function () {
            document.getElementById("shipyard_level") && (document.getElementById("shipyard_level").innerHTML = b.structure[buildingsName.shipyard].number);
            document.getElementById("energy_prod") &&
                (document.getElementById("energy_prod").innerHTML = Math.floor(b.energyProduction()));
            document.getElementById("energy_cons") && (document.getElementById("energy_cons").innerHTML = Math.floor(-b.energyConsumption()));
            var e = Math.floor(b.energyProduction() + b.energyConsumption()),
                h = b.energyMalus();
            1 < h ? h = 1 : 0 > h && (h = 0);
            document.getElementById("balance") && (document.getElementById("balance").innerHTML = parseInt(Math.floor(e)));
            document.getElementById("efficiency") && (document.getElementById("efficiency").innerHTML =
                Math.floor(1E4 * h) / 100 + "%");
            document.getElementById("popul") && (document.getElementById("popul").innerHTML = beauty(b.population) + " " + (0 < b.globalProd.population + b.populationRatio ? "<span class='green_text'>(+" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>"));
            document.getElementById("habitable") && (document.getElementById("habitable").innerHTML = beauty(b.habitableSpace()));
            h = b.rawProduction();
            var g = Array(resNum);
            b.importExport();
            for (e = 0; e < resNum; e++) g[e] = b.globalImport[e] - b.globalExport[e];
            for (e = 0; e < resNum; e++)
                if ((resources[e].show(game) || 0 < b.resources[e]) && (resources[e].ship || gameSettings.allShipres)) {
                    var u = beauty(b.resources[e]) + " <span class='" + (0 <= h[e] ? 0 < h[e] ? "green_text" : "gray_text" : "red_text oblique_txt") + "'>(" + (0 < h[e] ? "+" : "") + "" + beauty(h[e]) + "/s)</span>";
                    0 != g[e] && (u += "<span class='" + (0 <= g[e] ? 0 < g[e] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < g[e] ? "+" : "") + "" + beauty(g[e]) + "/s)</span>");
                    gameSettings.populationEnabled && e == resourcesName.biomass.id && 0 < (b.population - b.sustainable()) / 5E3 && (u += "<span class='gold_text' id='res_name_prod_biomass' name='" + e + "'>(-" + beauty((b.population - b.sustainable()) / 5E3) + "/s)</span>");
                    document.getElementById("res_name_prod_" + e) && (document.getElementById("res_name_prod_" + e).innerHTML = u)
                }
            for (h = 0; h < d.length; h++) e = d[h], ships[e].req <= currentPlanet.structure[buildingsName.shipyard].number && ships[e].show()
        };
        currentUpdater();
        y();
        C();
        $("#shipyard_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(I);
        $("#back_button").show();
        game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(), $("#b_market_icon").hide()))
    }

    function G() {
        currentUpdater = function () {};
        currentInterface = "techInterface";
        var b = "",
            d = 0;
        for (w = 0; w < game.researches.length; w++)
            if (game.researches[w].requirement() && game.researches[w].simplyAvailable()) {
                d =
                    Math.max(d, game.researches[w].pos[1]);
                b += "<div id='research_snippet_" + w + "' class='menu' style='position:absolute;width:200px;top:" + (20 + 165 * game.researches[w].pos[1]) + "px;left:" + (20 + 240 * game.researches[w].pos[0]) + "px;'>";
                b += "<img id='line_top_info' src='ui/line.png' />";
                b += "<div id='research_snippet_content_" + w + "' style='width:200px;'>";
                b += "<div style='width:200px;text-align:center;font-size:100%;' class='menu_dark blue_text button' >" + game.researches[w].name + "</div>";
                b += "<img id='line_down_info' src='ui/line.png' />";
                b += "<div style='width:200px;height:100px;text-align:center;font-size:80%;' class='menu'>";
                var e = !0,
                    g = 0,
                    l;
                for (l in game.researches[w].req)
                    if (!game.researches[researchesName[l]].available() || game.researches[researchesName[l]].level < game.researches[w].req[l]) e = !1, g++;
                if (e) game.researches[w].level >= game.researches[w].max ? (b += "<span class='blue_text' style='font-size: 100%;'>Level: " + (game.researches[w].level - game.researches[w].bonusLevel) + (0 < game.researches[w].bonusLevel ? " <span class='green_text'>(+" +
                    game.researches[w].bonusLevel + ") </span>" : " ") + "</span>", b += "<br><br><br><span class='red_text' style='font-size: 100%;'>Max Level Reached!</span>") : (b += "<span class='blue_text' style='font-size: 100%;height:20px;width:200;'>Level " + (game.researches[w].level - game.researches[w].bonusLevel) + (0 < game.researches[w].bonusLevel ? " <span class='green_text'>(+" + game.researches[w].bonusLevel + ") </span>" : "") + "</span><img src='ui/arrow_small.png' style='width:14px;height:14px;top:3px;position:relative'/><span class='blue_text' style='font-size: 100%;'>Level " +
                    (game.researches[w].level - game.researches[w].bonusLevel + 1) + (0 < game.researches[w].bonusLevel ? " <span class='green_text'>(+" + game.researches[w].bonusLevel + ") </span>" : " ") + "</span>", b += "<br><div class='button' style='height:40px;width:200;cursor:pointer;' id='buy_research_" + w + "' name='" + w + "'><span class='blue_text' id='buy_tech_rp_name_" + w + "' style='font-size: 100%;position:relative;top:6px;cursor:pointer;'>Buy with Research Pts</span><br><span id='buy_tech_rp_amount_" + w + "' style='position:relative;top:6px;cursor:pointer;' class='white_text'>" +
                    beauty(game.researches[w].cost()), e = "", gameSettings.showMultipliers && (b += " x" + beauty(game.researches[w].mult), e = " x" + beauty(game.researches[w].multBonus)), b += "</span></div>", b += 0 < game.timeTravelNum ? "<div class='button' style='height:40px;width:200;cursor:pointer;' id='buy_tech_" + w + "' name='" + w + "'><span class='green_text' id='buy_tech_tp_name_" + w + "' style='font-size:100%;position:relative;top:6px;height:40px;width:200;cursor:pointer;'>Buy with Technology Pts</span><br><span id='buy_tech_tp_amount_" +
                    w + "'style='position:relative;top:6px;cursor:pointer;' class='white_text'>" + beauty(game.researches[w].costBonus()) + e + "</span></div>" : "");
                else {
                    b += "<br><span class='red_text' style='font-size: 100%;'>This research requires:</span>";
                    for (l = 0; l < 3 - g; l++) b += "<br>";
                    for (l in game.researches[w].req) game.researches[researchesName[l]].level < game.researches[w].req[l] && (b += "<span class='red_text' style='font-size:100%;'>" + game.researches[researchesName[l]].name + " " + game.researches[w].req[l] + "</span><br>")
                }
                b += "</div>";
                b += "</div>";
                b += "<img id='line_down_info' src='ui/line.png' />";
                b += "</div>";
                e = {
                    "0,-1": "arrow_down",
                    "1,0": "arrow_small_left",
                    "0,1": "arrow_up",
                    "-1,0": "arrow_small"
                };
                for (l in game.researches[w].req)
                    if (game.researches[researchesName[l]].requirement()) {
                        g = game.researches[researchesName[l]].pos[0] - game.researches[w].pos[0];
                        var m = game.researches[researchesName[l]].pos[1] - game.researches[w].pos[1],
                            V = g + "," + m;
                        b += "<img src='ui/" + e[V] + ".png' name='" + V + "' style='width:32px;height:32px;position:absolute;top:" + (-16 +
                            Math.floor(165 * (game.researches[w].pos[1] + .5) + 82 * m)) + "px;left:" + (-16 + Math.floor(240 * (game.researches[w].pos[0] + .5) + 120 * g)) + "px;' />"
                    }
            }
        document.getElementById("tech_t_container") && (document.getElementById("tech_t_container").innerHTML = b);
        $("#tech_t_container").css("height", 185 + 165 * d + "px");
        for (var w = 0; w < game.researches.length; w++) game.researches[w].requirement() && (h("research_snippet_" + w, "<span class='white_text' style='font-size:70%;'>" + game.researches[w].description() + "</span>", 320), game.researches[w].level >=
            game.researches[w].max ? $("#buy_research_" + w).click(function () {
                (new v(210, 0, "<span class='blue_text text_shadow'>Max Level reached!</span>", "info")).drawToast()
            }) : $("#buy_research_" + w).click(function () {
                game.researches[parseInt($(this).attr("name"))].cost() <= game.researchPoint ? game.researches[parseInt($(this).attr("name"))].enable() : (new v(210, 0, "<span class='red_text red_text_shadow'>There are not enough Research Points!</span>", "info")).drawToast();
                G()
            }), 0 < game.timeTravelNum && (game.researches[w].level >=
                game.researches[w].max ? $("#buy_tech_" + w).click(function () {
                    (new v(210, 0, "<span class='blue_text text_shadow'>Max Level reached!</span>", "info")).drawToast()
                }) : $("#buy_tech_" + w).click(function () {
                    game.researches[parseInt($(this).attr("name"))].costBonus() <= game.techPoints ? game.researches[parseInt($(this).attr("name"))].enableBonus() : (new v(210, 0, "<span class='red_text red_text_shadow'>There are not enough Technology Points!</span>", "info")).drawToast();
                    G()
                })));
        currentUpdater = function () {
            for (var b = 0; b <
                game.researches.length; b++) game.researches[b].requirement() && game.researches[b].level < game.researches[b].max && (game.researches[b].cost() <= game.researchPoint ? ($("#buy_tech_rp_name_" + b).attr("class", "blue_text"), $("#buy_tech_rp_amount_" + b).attr("class", "white_text")) : ($("#buy_tech_rp_name_" + b).attr("class", "red_text"), $("#buy_tech_rp_amount_" + b).attr("class", "red_text")), game.researches[b].costBonus() <= game.techPoints ? ($("#buy_tech_tp_name_" + b).attr("class", "green_text"), $("#buy_tech_tp_amount_" + b).attr("class",
                "white_text")) : ($("#buy_tech_tp_name_" + b).attr("class", "red_text"), $("#buy_tech_tp_amount_" + b).attr("class", "red_text")))
        };
        currentUpdater();
        y();
        $("#tech_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(H);
        $("#back_button").show();
        game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(), $("#b_market_icon").hide()))
    }

    function ba() {
        currentUpdater =
            function () {};
        if (gameSettings.techTree) G();
        else {
            currentInterface = "researchInterface";
            var b = "";
            for (n = 0; n < game.researches.length; n++)
                if (game.researches[n].requirement() && game.researches[n].simplyAvailable()) {
                    var d = "blue_text",
                        e = "white_text",
                        h = "button",
                        g = "green_text";
                    game.researches[n].cost() > Math.floor(game.researchPoint) ? (avRes[n] = !1, e = d = "red_text") : (avRes[n] = !0, d = "blue_text", e = "white_text", h = "button", g = "green_text");
                    var l = game.researches[n].description().split("<br>").length;
                    b += "<li id='research" +
                        n + "' name='" + n + "' style='width:1200px; height:" + Math.max(116, 36 + 16 * l) + "px;'>";
                    b += "<div style='position:relative; top:8px; left:8px; width:900px;' id='research_title_" + n + "'>";
                    var m = !0,
                        w = 0,
                        T;
                    for (T in game.researches[n].req)
                        if (!game.researches[researchesName[T]].available() || game.researches[researchesName[T]].level < game.researches[n].req[T]) m = !1, w++;
                    b = game.researches[n].level >= game.researches[n].max ? b + ("<span class='blue_text' style='font-size: 100%;'>" + game.researches[n].name + " " + (game.researches[n].level -
                        game.researches[n].bonusLevel) + (0 < game.researches[n].bonusLevel ? " <span class='green_text'>(+" + game.researches[n].bonusLevel + ") </span>" : " ") + "<span class='white_text'>(Max Level)</span></span><span class='" + d + "'>    (Research Points: <span class='" + e + "'>" + beauty(game.researches[n].cost()) + "</span> x" + beauty(game.researches[n].mult) + ")</span>" + (0 < game.timeTravelNum ? "<span class='" + g + "'>    (Technology Points: <span class='" + e + "'>" + beauty(game.researches[n].costBonus()) + "</span> x" + beauty(game.researches[n].multBonus) +
                        ")</span>" : "") + "</div>") : b + ("<span class='blue_text' style='font-size: 100%;'>" + game.researches[n].name + " " + (game.researches[n].level - game.researches[n].bonusLevel) + (0 < game.researches[n].bonusLevel ? " <span class='green_text'>(+" + game.researches[n].bonusLevel + ") </span>" : "") + "</span><img src='ui/arrow_small.png' style='width:16px;height:16px;top:3px;position:relative'/><span class='blue_text' style='font-size: 100%;'>" + game.researches[n].name + " " + (game.researches[n].level - game.researches[n].bonusLevel +
                        1) + (0 < game.researches[n].bonusLevel ? " <span class='green_text'>(+" + game.researches[n].bonusLevel + ") </span>" : " ") + "</span><span class='" + d + "'>    (Research Points: <span class='" + e + "'>" + beauty(game.researches[n].cost()) + "</span>)</span>" + (0 < game.timeTravelNum ? "<span class='" + g + "'>    (Technology Points: <span class='" + e + "'>" + beauty(game.researches[n].costBonus()) + "</span> x" + beauty(game.researches[n].multBonus) + ")</span>" : "") + "</div>");
                    b += "<div style='position:relative; top:16px; left:8px; width:768px;height:" +
                        Math.max(80, 16 * l) + "px'>";
                    if (m) b += "<span class='white_text'>" + game.researches[n].description() + "</span></div>", b += "<div style='position:relative;top:-72px; left:700px;width:200px;height:32px;' class='" + h + "' name='" + n + "'  id='buy_research_" + n + "'>", b += "<span class='blue_text' style='position:relative;top:8px;'>Buy with Research Points</span>", b += "</div>", 0 < game.timeTravelNum && (b += "<div style='position:relative;top:-72px; left:700px;width:200px;height:32px;'class='" + h + "' name='" + n + "'  id='buy_tech_" +
                        n + "'>", b += "<span class='green_text' style='position:relative;top:8px;'>Buy with Tech Points</span>", b += "</div>");
                    else {
                        b += "<br><span class='red_text' style='font-size: 100%;'>This research requires:</span>";
                        for (T = 0; T < 3 - w; T++) b += "<br>";
                        for (T in game.researches[n].req) game.researches[researchesName[T]].level < game.researches[n].req[T] && (b += "<span class='red_text' style='font-size:100%;'>" + game.researches[researchesName[T]].name + " " + game.researches[n].req[T] + "</span><br>")
                    }
                    b += "</li>"
                }
            b += "<li id='research_empty' style='width:1024px; height:80px;'><div style='position:relative; top:8px; left:8px; width:640px;'></div></li>";
            document.getElementById("research_list") && (document.getElementById("research_list").innerHTML = b);
            for (var n = 0; n < game.researches.length; n++) game.researches[n].requirement() && (game.researches[n].level >= game.researches[n].max ? $("#buy_research_" + n).click(function () {
                (new v(210, 0, "<span class='blue_text text_shadow'>Max Level reached!</span>", "info")).drawToast()
            }) : $("#buy_research_" + n).click(function () {
                game.researches[parseInt($(this).attr("name"))].cost() <= game.researchPoint ? game.researches[parseInt($(this).attr("name"))].enable() :
                    (new v(210, 0, "<span class='red_text red_text_shadow'>There are not enough Research Points!</span>", "info")).drawToast();
                ba()
            }), 0 < game.timeTravelNum && (game.researches[n].level >= game.researches[n].max ? $("#buy_tech_" + n).click(function () {
                (new v(210, 0, "<span class='blue_text text_shadow'>Max Level reached!</span>", "info")).drawToast()
            }) : $("#buy_tech_" + n).click(function () {
                game.researches[parseInt($(this).attr("name"))].costBonus() <= game.techPoints ? game.researches[parseInt($(this).attr("name"))].enableBonus() :
                    (new v(210, 0, "<span class='red_text red_text_shadow'>There are not enough Technology Points!</span>", "info")).drawToast();
                ba()
            })));
            currentUpdater = function () {
                for (var b = 0; b < game.researches.length; b++)
                    if (game.researches[b].requirement()) {
                        var d = !1,
                            e = "blue_text",
                            h = "white_text";
                        game.researches[b].cost() > Math.floor(game.researchPoint) && avRes[b] && (d = !0, avRes[b] = !1, h = e = "red_text");
                        game.researches[b].cost() <= Math.floor(game.researchPoint) && !avRes[b] && (d = !0, avRes[b] = !0, e = "blue_text", h = "white_text");
                        d && ($("#research" +
                            b).length && ba(), d = "", d = game.researches[b].level >= game.researches[b].max ? d + ("<span class='blue_text' style='font-size: 100%;'>" + game.researches[b].name + " " + (game.researches[b].level - game.researches[b].bonusLevel) + (0 < game.researches[b].bonusLevel ? " <span class='green_text'>(+" + game.researches[b].bonusLevel + ") </span>" : " ") + "<span class='white_text'>(Max Level)</span></span><span class='" + e + "'>    (Research Points: <span class='" + h + "'>" + beauty(game.researches[b].cost()) + "</span>)</span>" + (0 < game.timeTravelNum ?
                            "<span class='" + g + "'>    (Technology Points: <span class='" + h + "'>" + beauty(game.researches[b].costBonus()) + "</span> x" + beauty(game.researches[b].multBonus) + ")</span>" : "")) : d + ("<span class='blue_text' style='font-size: 100%;'>" + game.researches[b].name + " " + (game.researches[b].level - game.researches[b].bonusLevel) + (0 < game.researches[b].bonusLevel ? " <span class='green_text'>(+" + game.researches[b].bonusLevel + ") </span>" : "") + "</span><img src='ui/arrow_small.png' style='width:16px;height:16px;top:3px;position:relative'/><span class='blue_text' style='font-size: 100%;'>" +
                            game.researches[b].name + " " + (game.researches[b].level - game.researches[b].bonusLevel + 1) + (0 < game.researches[b].bonusLevel ? " <span class='green_text'>(+" + game.researches[b].bonusLevel + ") </span>" : " ") + "</span><span class='" + e + "'>    (Research Points: <span class='" + h + "'>" + beauty(game.researches[b].cost()) + "</span>)</span>" + (0 < game.timeTravelNum ? "<span class='" + g + "'>    (Technology Points: <span class='" + h + "'>" + beauty(game.researches[b].costBonus()) + "</span> x" + beauty(game.researches[b].multBonus) + ")</span>" :
                                "")), document.getElementById("research_title_" + b) && (document.getElementById("research_title_" + b).innerHTML = d))
                    }
            };
            currentUpdater();
            y();
            $("#research_interface").show();
            $("#back_button").unbind();
            $("#back_button").click(H);
            $("#back_button").show();
            game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(), $("#b_market_icon").hide()))
        }
    }

    function S(b,
        d) {
        var e = d || gameSettings.mapzoomlevel;
        currentInterface = "mapInterface";
        currentNebula = b;
        currentUpdater = function () {};
        $("#map_image").attr("src", "img/nebula/" + b.icon);
        var h = "<img id='map_zoom_m' style='position:relative;top:8px;width:32px;height:32px;cursor:pointer;' src='ui/zoomm.png'/>";
        1 < game.mapsLength() && (h += "<img id='map_arrow_left' style='position:relative;top:4px;width:20px;height:20px;cursor:pointer;' src='ui/arrow_small_left.png'/>");
        h += b.name;
        1 < game.mapsLength() && (h += "<img id='map_arrow_right' style='position:relative;top:4px;width:20px;height:20px;cursor:pointer;' src='ui/arrow_small.png'/>");
        h += "<img id='map_zoom_p' style='position:relative;top:8px;width:32px;height:32px;cursor:pointer;' src='ui/zoomp.png'/>";
        document.getElementById("nebula_name") && (document.getElementById("nebula_name").innerHTML = h);
        $("#map_arrow_left").click(function () {
            var d = (b.id + nebulas.length) % game.mapsLength();
            S(nebulas[d], gameSettings.mapzoomlevel)
        });
        $("#map_arrow_right").click(function () {
            var d = (b.id + 1) % game.mapsLength();
            S(nebulas[d], gameSettings.mapzoomlevel)
        });
        $("#map_zoom_p").click(function () {
            1 <= gameSettings.mapzoomlevel &&
                (gameSettings.mapzoomlevel -= .2);
            1 > gameSettings.mapzoomlevel && (gameSettings.mapzoomlevel = 1);
            S(b, gameSettings.mapzoomlevel)
        });
        $("#map_zoom_m").click(function () {
            2 >= gameSettings.mapzoomlevel && (gameSettings.mapzoomlevel += .2);
            2 < gameSettings.mapzoomlevel && (gameSettings.mapzoomlevel = 2);
            S(b, gameSettings.mapzoomlevel)
        });
        h = "";
        for (var g = Array(b.planets.length), l = 0; l < b.planets.length; l++) {
            var u = "pnebula_gray_text";
            game.searchPlanet(b.planets[l]) && (u = "pnebula_text");
            game.searchPlanet(b.planets[l]) || null == planets[b.planets[l]].civis ||
                (u = "pnebula_red_text");
            var w = 1E12,
                m = w;
            w = b.planets[l];
            planets[game.capital].shortestPath[w] ? m = planets[game.capital].shortestPath[w].hops : planets[planetsName.solidad].shortestPath[w] && (m = planets[game.capital].shortestPath[planetsName.xora].hops + planets[planetsName.solidad].shortestPath[w].hops);
            planets[b.planets[0]].shortestPath[b.planets[l]] && (w = planets[b.planets[0]].shortestPath[b.planets[l]].hops, w += 11 * b.id);
            w = m;
            w <= game.researches[researchesName.astronomy].level && (h += "<div id='pdiv" + l + "' name='" +
                b.planets[l] + "' style='cursor: pointer;position:absolute;top:" + (0 + planets[b.planets[l]].y) / e + "px;left:" + (0 + planets[b.planets[l]].x) / e + "px;z-index:20;height:" + 24 / e + "px;' class='" + u + "'>", h += "<img style='width:" + 48 / e + "px;height:" + 48 / e + "px;position:relative;left:-" + 14 / e + "px;top:-" + 14 / e + "px;' id='pnebula" + b.planets[l] + "' src='img/" + planets[b.planets[l]].icon + "/" + planets[b.planets[l]].icon + ".png' />", h += "<span style='position:relative; left:-" + 8 / e + "px;top:-" + 34 / e + "px;cursor:pointer;'>" + planets[b.planets[l]].name +
                "</span>", h += "</div>");
            g[l] = Array(planets[b.planets[l]].routes.length);
            for (u = 0; u < planets[b.planets[l]].routes.length; u++)
                if (planets[b.planets[l]].routes[u].planet1 == planets[b.planets[l]].id) {
                    var N = planets[b.planets[l]].routes[u].cx();
                    m = planets[b.planets[l]].routes[u].cy();
                    var n = parseInt(planets[b.planets[l]].routes[u].distance());
                    g[l][u] = n;
                    if (w <= game.researches[researchesName.astronomy].level) {
                        var L = game.capital;
                        game.capital != b.planets[0] && (L = b.planets[0]);
                        L = Math.max(planets[L].shortestPath[planets[b.planets[l]].routes[u].planet1].hops,
                            planets[L].shortestPath[planets[b.planets[l]].routes[u].planet2].hops);
                        L += 11 * b.id;
                        L <= researches[researchesName.astronomy].level && (N = 180 * Math.atan(m / N) / Math.PI, 0 > m && 0 > N && (N += 180), h += "<div id='route" + l + "_" + u + "' name='" + l + "_" + u + "' style='position:absolute;top:" + parseInt((8 + planets[b.planets[l]].y) / e) + "px;left:" + parseInt((12 + planets[b.planets[l]].x) / e) + "px;z-index:8;'>", h += "<img src='ui/line.png' style='width:" + n / e + "px;height:3px;-ms-transform:rotate(" + N + "deg);-webkit-transform:rotate(" + N + "deg);transform:rotate(" +
                            N + "deg);transform-origin: top left;' /></div>")
                    }
                }
        }
        document.getElementById("map_icon_container") && (document.getElementById("map_icon_container").innerHTML = h);
        for (l = 0; l < b.planets.length; l++)
            for ($("#pdiv" + l).click(function () {
                    A(planets[parseInt($(this).attr("name"))])
                }), u = 0; u < planets[b.planets[l]].routes.length; u++) $("#route" + l + "_" + u).hover(function () {
                var b = $(this).attr("name").split("_"),
                    d = parseInt(b[0]);
                b = parseInt(b[1]);
                var e = "<span class='blue_text'>Distance: </span><span class='white_text'>" + parseInt(Math.floor(g[d][b])) +
                    "</span><br>";
                e += "<span class='blue_text'>Time (0.3): </span><span class='white_text'>" + parseInt(Math.floor(g[d][b] / .3)) + "s</span><br>";
                e += "<span class='blue_text'>Time (0.5): </span><span class='white_text'>" + parseInt(Math.floor(g[d][b] / .5)) + "s</span><br>";
                e += "<span class='blue_text'>Time (0.8): </span><span class='white_text'>" + parseInt(Math.floor(g[d][b] / .8)) + "s</span><br>";
                e += "<span class='blue_text'>Time (1.2): </span><span class='white_text'>" + parseInt(Math.floor(g[d][b] / 1.2)) + "s</span><br>";
                e += "<span class='blue_text'>Time (2.0): </span><span class='white_text'>" + parseInt(Math.floor(g[d][b] / 2)) + "s</span>";
                (new v(170, 10, e, "info")).drawInfo();
                $(document).on("mousemove", function (b) {
                    mouseX = b.pageX + 10;
                    mouseY = b.pageY + 10;
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                });
                $("#popup_info").css({
                    left: mouseX,
                    top: mouseY
                })
            }, function () {
                currentPopup.drop()
            }), $("#route" + l + "_" + u).mouseout(function () {
                $(document).on("mousemove", function () {})
            });
        y();
        $("#map_interface").show();
        $("#nebula_name").show();
        $("#back_button").unbind();
        $("#back_button").click(H);
        $("#back_button").show()
    }

    function ca(b, d, e, h, g, l) {
        return "all" == d || d == h ? "hub" != g && 0 >= e.shipNum() || !game.searchPlanet(h) && !l && e.civis != game.id ? !1 : "all" == b ? "hub" == e.fleetType() && 0 == game.timeTravelNum ? !1 : !0 : "attack" == b && "hub" != g || "nowar" == b && "hub" != g && "War Fleet" != e.fleetType() && "Scout Fleet" != e.fleetType() ? !0 : "hub" == b ? "hub" != g || 2 > game.planets.length || e.civis != game.id ? !1 : !0 : "cargo" == b && "hub" == g && 0 < e.shipNum() && 4 > game.planets.length && 0 == game.timeTravelNum ? !0 : "hub" != b && "hub" ==
            g ? !1 : "war" == b && ("War Fleet" == e.fleetType() || "Scout Fleet" == e.fleetType()) || "miner" == b && "Miner Fleet" == e.fleetType() || "cargo" == b && ("Cargo Fleet" == e.fleetType() || "Colonial Fleet" == e.fleetType()) ? !0 : !1 : !1
    }

    function M(b) {
        currentInterface = "shipInterface";
        var d = b.t;
        b = b.p;
        currentCriteria = {
            t: d,
            p: b
        };
        void 0 == currentCriteria && (currentCriteria = {
            t: "nowar",
            p: "all"
        });
        for (var e = 0, g = "", l = 0; l < planets.length; l++) {
            var u = !1,
                m;
            for (m in planets[l].fleets) planets[l].fleets[m].civis == game.id && 0 != m && (u = !0);
            for (var w in planets[l].fleets) {
                if (ca(d,
                        b, planets[l].fleets[w], l, w, u)) {
                    g += "<li id='fleet" + l + "_" + w + "' name='" + l + "_" + w + "' style='height:80px;' class='button'>";
                    g += "<div style='width:98%; height:80px;position:relative;'>";
                    g += "<div style='position:relative; top:8px; left:8px'>";
                    var n = planets[l].fleets[w].name;
                    "hub" == w && (n = planets[l].name + " Hub Fleet");
                    if (planets[l].fleets[w].civis != game.id) {
                        var t = "red_text",
                            K = "[Enemy] ";
                        game.reputation[planets[l].fleets[w].civis] >= repLevel.allied.min ? (t = "green_text", K = "[Allied] ") : game.reputation[planets[l].fleets[w].civis] >=
                            repLevel.friendly.min ? (t = "white_text", K = "[Friendly] ") : game.reputation[planets[l].fleets[w].civis] >= repLevel.neutral.min && (t = "gray_text", K = "[Neutral] ");
                        g += "<span class='" + t + "' style='font-size: 100%;'>" + K + n + "</span>"
                    } else g += "<span class='blue_text' style='font-size: 100%;'>" + n + " </span>", g += "<img id='b_rename_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/RENAME.png' style='width:16px;height:16px;position:relative;top:3px;cursor:pointer;'/>";
                    g += "<span class='white_text'> orbiting </span><span class='blue_text' style='font-size: 100%;cursor:pointer;' id='orbiting_" +
                        l + "_" + w + "' name='" + l + "'>" + planets[l].name + "</span></div>";
                    game.id == planets[l].fleets[w].civis && "hub" != w ? (g += "<div id='quick_fleet_menu_" + l + "_" + w + "' style='position:absolute;right:10%;bottom:10%'>", game.searchPlanet(l) && (g += "<img id='b_load_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/load.png' class='icon_big' style='cursor:pointer;'/>", g += "<img id='b_unload_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/unload.png' class='icon_big' style='cursor:pointer;'/>"), g += "<img id='b_merge_icon_" + l + "_" + w + "' name='" +
                        l + "_" + w + "' src='ui/merge.png' class='icon_big' style='cursor:pointer;'/>", g += "<img id='b_divide_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/divide.png' class='icon_big' style='cursor:pointer;'/>", g += "<img id='b_move_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/move.png' class='icon' style='cursor:pointer;'/>", game.searchPlanet(l) && (g += "<img id='b_automove_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/automove.png' class='icon' style='cursor:pointer;'/>", g += "<img id='b_delivery_icon_" + l + "_" + w + "' name='" +
                            l + "_" + w + "' src='ui/delivery.png' class='icon' style='cursor:pointer;'/>", g += "<img id='b_void_ship_icon' src='ui/void.png' class='icon' style='cursor:pointer;'/>", g += "<img id='b_dismantle_ship_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/x_red.png' class='icon' style='cursor:pointer;'/>"), g += "</div>") : "hub" == w && (g += "<div id='quick_fleet_menu_" + l + "_" + w + "' style='position:absolute;right:10%;bottom:10%'>", g += "<img id='b_divide_icon_" + l + "_" + w + "' name='" + l + "_" + w + "' src='ui/divide.png' class='icon_big' style='cursor:pointer;'/>",
                        g += "</div>");
                    g += "</div>";
                    g += "</li>";
                    e++
                }
                0 < w && 0 == planets[l].fleets[w].shipNum() && "hub" != w && delete planets[l].fleets[w]
            }
        }
        0 == e && (g += "<li id='nofleet' style='height:80px;' class='button'><div style='width:98%; height:80px;position:relative;'><div style='text-align:center;position:relative; top:8px; left:8px'><span class='gray_text' style='font-size: 100%;'>There are no fleets to show</span> </li>");
        document.getElementById("ship_list") && (document.getElementById("ship_list").innerHTML = g);
        for (l = 0; l < planets.length; l++) {
            u = !1;
            for (m in planets[l].fleets) planets[l].fleets[m].civis == game.id && (u = !0);
            for (w in planets[l].fleets)(game.searchPlanet(l) || game == civis[planets[l].fleets[w].civis] || u) && ("hub" == w || 0 < planets[l].fleets[w].shipNum()) && (0 != w && ($("#orbiting_" + l + "_" + w).unbind(), $("#orbiting_" + l + "_" + w).click(function () {
                var b = parseInt($(this).attr("name"));
                A(planets[b])
            }), "hub" != w && ($("#b_move_icon_" + l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                var b = currentFleetId.split("_")[0];
                S(nebulas[planets[b].map]);
                for (b = 0; b < currentNebula.planets.length; b++) $("#pdiv" + b).unbind(), $("#pdiv" + b).click(function () {
                    var b = currentFleetId.split("_"),
                        d = b[0],
                        e = planets[d].fleets[b[1]];
                    e.type = "normal";
                    parseInt(d) != parseInt($(this).attr("name")) ? (e = e.move(parseInt(d), parseInt($(this).attr("name"))), delete planets[d].fleets[b[1]], document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = ""), M(currentCriteria), b = 0, 60 <= e ? b = "" + parseInt(Math.floor(e / 60)) + " minutes and " + parseInt(Math.floor(e %
                        60)) + " seconds" : 0 > e ? (d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info"), d.drawToast()) : b = "" + parseInt(Math.floor(e)) + " seconds", d = new v(210, 0, "<span class='red_text red_text_shadow'>Fleet will arrive in " + b + "</span>", "info")) : d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info");
                    d.drawToast()
                })
            }), game.searchPlanet(l) && ($("#b_automove_icon_" + l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                var b = currentFleetId.split("_")[0];
                S(nebulas[planets[b].map]);
                for (b = 0; b < currentNebula.planets.length; b++) $("#pdiv" + b).unbind(), $("#pdiv" + b).click(function () {
                    if (planets[parseInt($(this).attr("name"))].civis == game.id) {
                        var b = currentFleetId.split("_"),
                            d = b[0],
                            e = planets[d].fleets[b[1]];
                        parseInt(d) != parseInt($(this).attr("name")) ? Y(e, parseInt(d), parseInt($(this).attr("name")), parseInt(b[1])) : (b = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info"), b.drawToast())
                    } else b = new v(210, 0, "<span class='red_text red_text_shadow'>This is an enemy planet!</span>",
                        "info"), b.drawToast()
                })
            }), $("#b_delivery_icon_" + l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                var b = currentFleetId.split("_")[0];
                S(nebulas[planets[b].map]);
                (new v(210, 0, "<span class='blue_text text_shadow'>Select the delivery's destination</span>", "info")).drawToast();
                for (b = 0; b < currentNebula.planets.length; b++) $("#pdiv" + b).unbind(), $("#pdiv" + b).click(function () {
                    if (planets[parseInt($(this).attr("name"))].civis == game.id) {
                        var b = currentFleetId.split("_"),
                            d = b[0],
                            e = planets[d].fleets[b[1]];
                        e.type = "delivery";
                        parseInt(d) != parseInt($(this).attr("name")) ? (e = e.move(parseInt(d), parseInt($(this).attr("name"))), delete planets[d].fleets[b[1]], document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = ""), M(currentCriteria), b = 0, 60 <= e ? b = "" + parseInt(Math.floor(e / 60)) + " minutes and " + parseInt(Math.floor(e % 60)) + " seconds" : 0 >= e ? (d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info"), d.drawToast()) : b = "" + parseInt(Math.floor(e)) +
                            " seconds", d = new v(210, 0, "<span class='blue_text text_shadow'>Fleet will arrive in " + b + "</span>", "info")) : d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info")
                    } else d = new v(210, 0, "<span class='red_text red_text_shadow'>This is an enemy planet!</span>", "info");
                    d.drawToast()
                })
            }), $("#b_dismantle_ship_icon_" + l + "_" + w).unbind(), $("#b_dismantle_ship_icon_" + l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                (new v(210, 120, "<br><span class='red_text'>Are you sure you want to dismantle this fleet?</span>",
                    "confirm",
                    function () {
                        var b = currentFleetId.split("_"),
                            d = parseInt(b[0]),
                            e = planets[d].fleets[b[1]];
                        e.unload(d);
                        for (var h = 0; h < ships.length; h++) {
                            for (var g = 0; g < resNum; g++) planets[d].resourcesAdd(g, ships[h].cost[g] * e.ships[h] / 2);
                            e.ships[h] = 0
                        }
                        delete planets[d].fleets[b[1]];
                        document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "");
                        currentPopup.drop();
                        M(currentCriteria)
                    })).draw()
            })))), game.searchPlanet(l) && "hub" != w && ($("#b_load_icon_" + l + "_" + w).click(function () {
                var b =
                    $(this).attr("name").split("_"),
                    d = b[0];
                b = planets[d].fleets[b[1]];
                b.planet = d;
                (new v(512, 374, "<br><span class='blue_text text_shadow'>Select the amount of resources</span><br>", "loadShip", b)).draw()
            }), $("#b_unload_icon_" + l + "_" + w).click(function () {
                var b = $(this).attr("name").split("_"),
                    d = b[0];
                b = planets[d].fleets[b[1]];
                currentFleetId = $(this).attr("name");
                b.unload(d);
                (new v(210, 0, "<span class='blue_text text_shadow'>Fleet unloaded on " + planets[d].name + "</span>", "info")).drawToast()
            })), $("#b_merge_icon_" +
                l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                (new v(210, 0, "<span class='blue_text text_shadow'>Select the Fleet to join</span>", "info")).drawToast();
                var b = currentFleetId.split("_")[0];
                oldCriteria = currentCriteria;
                M({
                    t: "all",
                    p: parseInt(b)
                });
                for (var d in planets[b].fleets)(game.searchPlanet(b) || game == civis[planets[b].fleets[d].civis]) && ("hub" == w || 0 < planets[b].fleets[d].shipNum()) ? ($("#fleet" + b + "_" + d).unbind(), $("#fleet" + b + "_" + d).click(function () {
                    var b = $(this).attr("name").split("_"),
                        d = b[0],
                        e = planets[d].fleets[b[1]],
                        h = currentFleetId.split("_"),
                        g = h[0],
                        l = planets[g].fleets[h[1]];
                    d != g ? b = new v(210, 0, "<span class='red_text red_text_shadow'>Fleets are orbiting different planets! Can't merge them.</span>", "info") : b[1] == h[1] ? b = new v(210, 0, "<span class='red_text red_text_shadow'>Can't merge with itself</span>", "info") : (e.fusion(l), delete planets[g].fleets[h[1]], b = new v(210, 0, "<span class='blue_text text_shadow'>Fleets merged</span>", "info"));
                    b.drawToast();
                    M(oldCriteria)
                })) : ($("#fleet" +
                    b + "_" + d).unbind(), $("#fleet" + b + "_" + d).click(function () {
                    (new v(210, 0, "<span class='red_text red_text_shadow'>Can't merge with this fleet!</span>", "info")).drawToast()
                }))
            }), $("#b_divide_icon_" + l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                for (var b = $(this).attr("name").split("_"), d = planets[b[0]].fleets[b[1]], e = b = 0; e < ships.length; e++) 0 < d.ships[e] && b++;
                d = new v(420, Math.min(64 + 20 * b, 240), "<br><span class='blue_text text_shadow'>Select the number of ships</span><br>", "fleetDivide", d);
                console.log(b);
                d.draw();
                M(currentCriteria);
                document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "")
            }), "hub" != w && $("#b_rename_icon_" + l + "_" + w).click(function () {
                currentFleetId = $(this).attr("name");
                var b = $(this).attr("name").split("_");
                (new v(360, 140, "<br><span class='blue_text text_shadow'>Type the new name</span><br>", "renameFleet", planets[b[0]].fleets[b[1]])).draw()
            }))
        }
        K = "<ul id='ship_mini_list2' style='text-align:left;'>";
        d = new z("overview_button", "Cargo Fleets", 224, 48,
            function () {
                M({
                    t: "cargo",
                    p: "all"
                })
            });
        K += d.getHtml();
        b = new z("minerfleets_button", "Miner Fleets", 224, 48, function () {
            M({
                t: "miner",
                p: "all"
            })
        });
        0 < game.researches[researchesName.space_mining].level && (K += b.getHtml());
        e = new z("hubfleets_button", "Hub Fleets", 224, 48, function () {
            M({
                t: "hub",
                p: "all"
            })
        });
        gameSettings.showHub && (4 <= game.planets.length || 0 < game.timeTravelNum) && (K += e.getHtml());
        g = new z("warfleets_button", "War Fleets", 224, 48, function () {
            M({
                t: "war",
                p: "all"
            })
        });
        K += g.getHtml();
        l = new z("traveling_button", "Traveling Fleets",
            224, 48,
            function () {
                U("normal")
            });
        K += l.getHtml();
        u = new z("marketship_button", "Market Fleets", 224, 48, function () {
            U("market")
        });
        5 <= game.researches[researchesName.astronomy].level && (K += u.getHtml());
        n = new z("autoroutesov_button", "Auto-routes", 224, 48, function () {
            U("auto")
        });
        K += n.getHtml();
        t = Array(game.planets.length);
        for (var L = 0; L < game.planets.length; L++) t[L] = new z("autoroutesov_" + L + "_button", "<img class='icon' style='position:absolute;top:8px;left:8px' src='img/" + planets[game.planets[L]].icon + "/" + planets[game.planets[L]].icon +
            ".png'/>" + planets[game.planets[L]].name + "", 224, 48,
            function () {
                var b = $(this).attr("id").split("_");
                currentPlanet = planets[game.planets[parseInt(b[1])]];
                U(game.planets[parseInt(b[1])])
            }), K += t[L].getHtml();
        K += "</ul>";
        document.getElementById("ship_mini_list") && (document.getElementById("ship_mini_list").innerHTML = K);
        $("#ship_mini_list").css("position", "absolute");
        $("#ship_mini_list").css("top", "8px");
        K = 6;
        0 < game.researches[researchesName.space_mining].level && K++;
        $("#ship_info_placeholder").css("height", 48 *
            (game.planets.length + K) + 16 + "px");
        d.enable();
        b.enable();
        e.enable();
        g.enable();
        l.enable();
        u.enable();
        n.enable();
        for (L = 0; L < game.planets.length; L++) t[L].enable();
        for (l = 0; l < planets.length; l++) {
            u = !1;
            for (m in planets[l].fleets) planets[l].fleets[m].civis == game.id && (u = !0);
            for (w in planets[l].fleets)(game.searchPlanet(l) || game == civis[planets[l].fleets[w].civis] || u) && ("hub" == w || 0 < planets[l].fleets[w].shipNum()) && ($("#fleet" + l + "_" + w).unbind(), $("#fleet" + l + "_" + w).click(function () {
                var b = $(this).attr("name").split("_"),
                    d = b[0],
                    e = planets[d].fleets[b[1]],
                    g = uiScheduler.fleetInfo(d, b[1], e),
                    l = g.html;
                g = g.cnt;
                $("#ship_infolist_placeholder").css("height", "" + (768 + 16 * g) + "px");
                if (game == civis[e.civis]) {
                    e.hp();
                    e.armor();
                    e.power();
                    new z("conquer_button", "Colonize " + planets[d].name, 224, 40, function () {
                        var b = currentFleetId.split("_"),
                            d = b[0];
                        b = planets[d].fleets[b[1]];
                        var e = 200 * planets[d].structure[buildingsName.turret].number + 500 * planets[d].structure[buildingsName.laser].number,
                            h = 250 * planets[d].structure[buildingsName.pierturret].number,
                            g = 150 * planets[d].structure[buildingsName.turret].number + 100 * planets[d].structure[buildingsName.laser].number + 100 * planets[d].structure[buildingsName.pierturret].number + 1E3 * planets[d].structure[buildingsName.shieldturret].number,
                            l = 1E3 * planets[d].structure[buildingsName.turret].number + 2E3 * planets[d].structure[buildingsName.laser].number + 1E3 * planets[d].structure[buildingsName.pierturret].number + 5E3 * planets[d].structure[buildingsName.shieldturret].number;
                        e = (b.hp() + 1) / (h + e + b.armor() * e / (h + e + .01) + .01);
                        if ((l +
                                1) / (1.1 * b.power() - g + .01) < e) {
                            g = !1;
                            for (l = 0; !g && l < civis[planets[d].civis].planets.length;) civis[planets[d].civis].planets[l] == d ? g = !0 : l++;
                            g ? (civis[planets[d].civis].planets.splice(l, 1), civis[planets[d].civis].capital == d && 0 < civis[planets[d].civis].planets.length && (civis[planets[d].civis].capital = civis[planets[d].civis].planets[0]), setRep(planets[d].civis, game.id, repLevel.hostile.min), planets[d].civis = b.civis, game.pushPlanet(d), save(), submitNumber("Number of planets", game.planets.length), submitNumber("Infuence",
                                game.influence()), currentPlanet = planets[d], A(currentPlanet), pop = new v(210, 96, "<br><span class='blue_text text_shadow'>" + planets[d].name + " has been conquered!</span>", "Ok")) : pop = new v(210, 96, "<br><span class='blue_text text_shadow'>ERROR 168!</span>", "Ok")
                        } else pop = new v(210, 96, "<br><span class='blue_text text_shadow'>Your fleet has been destroyed!</span>", "Ok");
                        pop.draw()
                    });
                    var u = new z("colonize_button", "Colonize " + planets[d].name, 224, 40, function () {
                            var b = currentFleetId.split("_"),
                                d = parseInt(b[0]),
                                e = planets[d].fleets[b[1]],
                                h = 0;
                            e.unload(d);
                            for (var g = 0; g < ships.length; g++) "Colonial Ship" == ships[g].type && 0 < e.ships[g] ? (planets[d].resources[resourcesName.iron.id] += .5 * ships[g].cost[resourcesName.iron.id] * e.ships[g], planets[d].resources[resourcesName.steel.id] += .5 * ships[g].cost[resourcesName.steel.id] * e.ships[g], planets[d].resources[resourcesName.titanium.id] += .5 * ships[g].cost[resourcesName.titanium.id] * e.ships[g], planets[d].resources[resourcesName.robots.id] += .5 * ships[g].cost[resourcesName.robots.id] *
                                e.ships[g], planets[d].resources[resourcesName.nanotubes.id] += .5 * ships[g].cost[resourcesName.nanotubes.id] * e.ships[g], e.ships[g] = 0) : h++;
                            0 == h && delete planets[d].fleets[b[1]];
                            document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "");
                            planets[d].civis && (civis[planets[d].civis].removePlanet(d), setRep(planets[d].civis, game.id, repLevel.hostile.min));
                            planets[d].civis = e.civis;
                            planets[d].fleets[0].civis = e.civis;
                            game.pushPlanet(d);
                            save();
                            submitNumber("Number of planets",
                                game.planets.length);
                            submitNumber("Infuence", game.influence());
                            currentPlanet = planets[d];
                            A(currentPlanet);
                            pop = new v(210, 96, "<br><span class='blue_text text_shadow'>" + planets[d].name + " has been colonized!</span>", "Ok");
                            pop.draw()
                        }),
                        m = new z("warp_button", "Use the Space Gate", 224, 40, function () {
                            var b = currentFleetId.split("_"),
                                d = b[0],
                                e = planets[d].fleets[b[1]],
                                h = Math.ceil(e.totalWeight() / (1E5 * Math.sqrt(planets[d].structure[buildingsName.space_machine].number)));
                            planets[d].resources[resourcesName.antimatter.id] >=
                                h ? (planets[planetsName.solidad].fleetPush(e), delete planets[d].fleets[b[1]], planets[d].resources[resourcesName.antimatter.id] -= h, 0 > planets[d].resources[resourcesName.antimatter.id] && (planets[d].resources[resourcesName.antimatter.id] = 0), B("other", planets[d]), b = new v(210, 0, "<span class='blue_text'>Fleet moved to Solidad</span>", "info")) : (B("other", planets[d]), b = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough antimatter to move this fleet</span>", "info"));
                            b.drawToast()
                        });
                    g = new z("load_button",
                        "Load", 224, 40,
                        function () {
                            var b = currentFleetId.split("_"),
                                d = b[0];
                            b = planets[d].fleets[b[1]];
                            b.planet = d;
                            (new v(512, 374, "<br><span class='blue_text text_shadow'>Select the amount of resources</span><br>", "loadShip", b)).draw()
                        });
                    var J = new z("unload_button", "Unload", 224, 40, function () {
                            e.unload(d);
                            (new v(210, 0, "<span class='blue_text text_shadow'>Fleet unloaded on " + planets[d].name + "</span>", "info")).drawToast()
                        }),
                        n = new z("move_button", "Move", 224, 40, function () {
                            var b = currentFleetId.split("_")[0];
                            S(nebulas[planets[b].map]);
                            for (b = 0; b < currentNebula.planets.length; b++) $("#pdiv" + b).unbind(), $("#pdiv" + b).click(function () {
                                var b = currentFleetId.split("_"),
                                    d = b[0],
                                    e = planets[d].fleets[b[1]];
                                e.type = "normal";
                                parseInt(d) != parseInt($(this).attr("name")) ? (e = e.move(parseInt(d), parseInt($(this).attr("name"))), delete planets[d].fleets[b[1]], document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = ""), M(currentCriteria), b = 0, 60 <= e ? b = "" + parseInt(Math.floor(e / 60)) + " minutes and " + parseInt(Math.floor(e %
                                    60)) + " seconds" : 0 > e ? (d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info"), d.drawToast()) : b = "" + parseInt(Math.floor(e)) + " seconds", d = new v(210, 0, "<span class='blue_text text_shadow'>Fleet will arrive in " + b + "</span>", "info")) : d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info");
                                d.drawToast()
                            })
                        }),
                        N = new z("delivery_button", "Delivery", 224, 40, function () {
                            var b = currentFleetId.split("_")[0];
                            S(nebulas[planets[b].map]);
                            for (b = 0; b <
                                currentNebula.planets.length; b++) $("#pdiv" + b).unbind(), $("#pdiv" + b).click(function () {
                                if (planets[parseInt($(this).attr("name"))].civis == game.id) {
                                    var b = currentFleetId.split("_"),
                                        d = b[0],
                                        e = planets[d].fleets[b[1]];
                                    e.type = "delivery";
                                    parseInt(d) != parseInt($(this).attr("name")) ? (e = e.move(parseInt(d), parseInt($(this).attr("name"))), delete planets[d].fleets[b[1]], document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = ""), M(currentCriteria), b = 0, 60 <= e ? b = "" + parseInt(Math.floor(e /
                                        60)) + " minutes and " + parseInt(Math.floor(e % 60)) + " seconds" : 0 >= e ? (d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info"), d.drawToast()) : b = "" + parseInt(Math.floor(e)) + " seconds", d = new v(210, 0, "<span class='blue_text text_shadow'>Fleet will arrive in " + b + "</span>", "info")) : d = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info")
                                } else d = new v(210, 0, "<span class='red_text red_text_shadow'>This is an enemy planet!</span>", "info");
                                d.drawToast()
                            })
                        }),
                        Q = new z("automove_button", "Automatic Route", 224, 40, function () {
                            var b = currentFleetId.split("_")[0];
                            S(nebulas[planets[b].map]);
                            for (b = 0; b < currentNebula.planets.length; b++) $("#pdiv" + b).unbind(), $("#pdiv" + b).click(function () {
                                if (planets[parseInt($(this).attr("name"))].civis == game.id) {
                                    var b = currentFleetId.split("_"),
                                        d = b[0],
                                        e = planets[d].fleets[b[1]];
                                    parseInt(d) != parseInt($(this).attr("name")) ? Y(e, parseInt(d), parseInt($(this).attr("name")), parseInt(b[1])) : (b = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>",
                                        "info"), b.drawToast())
                                } else b = new v(210, 0, "<span class='red_text red_text_shadow'>This is an enemy planet!</span>", "info"), b.drawToast()
                            })
                        }),
                        K = new z("divide_button", "Split Fleet", 224, 40, function () {
                            for (var b = currentFleetId.split("_"), d = planets[b[0]].fleets[b[1]], e = b = 0; e < ships.length; e++) 0 < d.ships[e] && b++;
                            d = new v(420, Math.min(64 + 20 * b, 240), "<br><span class='blue_text text_shadow'>Select the number of ships</span><br>", "fleetDivide", d);
                            console.log(b);
                            d.draw();
                            M(currentCriteria);
                            document.getElementById("ship_info_list") &&
                                (document.getElementById("ship_info_list").innerHTML = "")
                        }),
                        na = new z("merge_button", "Merge Fleet", 224, 40, function () {
                            (new v(210, 0, "<span class='blue_text text_shadow'>Select the Fleet to join</span>", "info")).drawToast();
                            var b = currentFleetId.split("_")[0];
                            oldCriteria = currentCriteria;
                            M({
                                t: "attack",
                                p: parseInt(b)
                            });
                            for (var d in planets[b].fleets)(game.searchPlanet(b) || game == civis[planets[b].fleets[d].civis]) && ("hub" == w || 0 < planets[b].fleets[d].shipNum()) ? ($("#fleet" + b + "_" + d).unbind(), $("#fleet" + b + "_" + d).click(function () {
                                var b =
                                    $(this).attr("name").split("_"),
                                    d = b[0],
                                    e = planets[d].fleets[b[1]],
                                    h = currentFleetId.split("_"),
                                    g = h[0],
                                    l = planets[g].fleets[h[1]];
                                d != g ? b = new v(210, 0, "<span class='red_text red_text_shadow'>Fleets are orbiting different planets! Can't merge them.</span>", "info") : b[1] == h[1] ? b = new v(210, 0, "<span class='red_text red_text_shadow'>Can't merge with itself</span>", "info") : (e.fusion(l), delete planets[g].fleets[h[1]], b = new v(210, 0, "<span class='blue_text text_shadow'>Fleets merged</span>", "info"));
                                b.drawToast();
                                M(oldCriteria)
                            })) : ($("#fleet" + b + "_" + d).unbind(), $("#fleet" + b + "_" + d).click(function () {
                                (new v(210, 0, "<span class='red_text red_text_shadow'>Can't merge with this fleet!</span>", "info")).drawToast()
                            }))
                        }),
                        L = new z("joinhub_button", "Join Hub Fleet", 224, 40, function () {
                            var b = currentFleetId.split("_"),
                                d = b[0],
                                e = planets[d].fleets[b[1]];
                            e.unload(d);
                            planets[d].fleets.hub.fusion(e);
                            delete planets[d].fleets[b[1]];
                            M(currentCriteria)
                        }),
                        aa = new z("mergeauto_button", "Merge with Autoroute", 224, 40, function () {
                            (new v(210,
                                0, "<span class='blue_text text_shadow'>Select the Autoroute to join</span>", "info")).drawToast();
                            var b = currentFleetId.split("_");
                            b = parseInt(b[0]);
                            U(b);
                            for (var d = fleetSchedule.civisFleet(game.id), e = 0; e < d.length; e++) d[e].origin != b && d[e].destination != b || "auto" != fleetSchedule.fleets[d[e].fleet].type || ($("#travel" + d[e].fleet).unbind(), $("#travel" + d[e].fleet).click(function () {
                                var b = $(this).attr("name").split("_"),
                                    d = parseInt(b[1]);
                                parseInt(b[0]);
                                b = currentFleetId.split("_");
                                var e = b[0],
                                    h = planets[e].fleets[b[1]];
                                h.speed() > fleetSchedule.fleets[d].speed() ? d = new v(210, 0, "<span class='red_text text_shadow'>Select a fleet slower than the auto route!</span>", "info") : (h.unload(e), fleetSchedule.fleets[d].fusion(h), delete planets[e].fleets[b[1]], M(currentCriteria), d = new v(210, 0, "<span class='blue_text text_shadow'>Fleet merged</span>", "info"));
                                d.drawToast()
                            }))
                        }),
                        t = new z("rename_button", "Rename Fleet", 224, 40, function () {
                            var b = currentFleetId.split("_");
                            (new v(360, 140, "<br><span class='blue_text text_shadow'>Type the new name</span><br>",
                                "renameFleet", planets[b[0]].fleets[b[1]])).draw()
                        }),
                        T = new z("attack_button", "Attack Fleet", 224, 40, function () {
                            var b = currentFleetId.split("_")[0];
                            M({
                                t: "attack",
                                p: b
                            });
                            var d = new v(210, 0, "<span class='blue_text text_shadow'>Select the enemy fleet</span>", "info");
                            d.drawToast();
                            $("#ship_list").children().each(function (e, h) {
                                var g = $(this).attr("name").split("_");
                                parseInt(g[0]) == b && planets[g[0]].fleets[parseInt(g[1])].civis == planets[b].civis && planets[g[0]].fleets[parseInt(g[1])].civis != game.id || $(this).css("display",
                                    "none");
                                $(this).unbind();
                                $(this).click(function () {
                                    var b = $(this).attr("name").split("_"),
                                        e = currentFleetId.split("_"),
                                        h = e[0],
                                        g = planets[b[0]].fleets[parseInt(b[1])].battle(planets[h].fleets[e[1]], !1),
                                        l = planets[b[0]].fleets[parseInt(b[1])].civis;
                                    "atk" == g.winner ? (d = new v(210, 96, "<br><span class='blue_text text_shadow'>Your fleet won the battle!</span>", "Ok"), d.draw(), 0 == planets[b[0]].fleets[parseInt(b[1])].shipNum() && delete planets[b[0]].fleets[parseInt(b[1])]) : "def" == g.winner ? (d = new v(210, 96, "<br><span class='red_text red_text_shadow'>Your fleet lost the battle!</span>",
                                        "Ok"), d.draw(), 0 == planets[h].fleets[e[1]].shipNum() && delete planets[h].fleets[e[1]]) : "draw" == g.winner && (d = new v(210, 96, "<br><span class='orange_text'>The battle resulted in a draw!</span>", "Ok"), d.draw(), 0 == planets[h].fleets[e[1]].shipNum() && delete planets[h].fleets[e[1]], 0 == planets[b[0]].fleets[parseInt(b[1])].shipNum() && delete planets[b[0]].fleets[parseInt(b[1])]);
                                    0 < game.timeTravelNum && setRep(l, game.id, game.reputation[l] - repLoss[game.repName(l)]);
                                    document.getElementById("ship_list") && (document.getElementById("ship_list").innerHTML =
                                        g.r);
                                    document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = "")
                                });
                                $(this).hover(function () {
                                    var b = $(this).attr("name").split("_"),
                                        d = currentFleetId.split("_"),
                                        e = d[0];
                                    d = planets[b[0]].fleets[parseInt(b[1])].battle(planets[e].fleets[d[1]], !0);
                                    b = planets[b[0]].fleets[parseInt(b[1])].civis;
                                    e = "";
                                    "atk" == d.winner ? e += "<span class='green_text text_shadow'>Your fleet will win the battle!</span>" : "def" == d.winner ? e += "<span class='red_text red_text_shadow'>Your fleet will lose the battle!</span>" :
                                        "draw" == d.winner && (e += "<span class='orange_text'>The battle will result in a draw!</span>");
                                    0 < game.timeTravelNum && (e += "<br><span class='red_text red_text_shadow'>You will lose " + beauty(repLoss[game.repName(b)]) + " reputation <br> with " + civis[b].name + "!</span>");
                                    (new v(200, 10, e, "info")).drawInfo();
                                    $(document).on("mousemove", function (b) {
                                        mouseX = b.pageX + 10;
                                        mouseY = b.pageY + 10;
                                        $("#popup_info").css({
                                            left: mouseX,
                                            top: mouseY
                                        })
                                    });
                                    $("#popup_info").css({
                                        left: mouseX,
                                        top: mouseY
                                    })
                                }, function () {
                                    currentPopup.drop()
                                });
                                $(this).mouseout(function () {
                                    $(document).on("mousemove", function () {})
                                })
                            })
                        });
                    if ("hub" != b[1]) {
                        0 < b[1] && (l += T.getHtml());
                        for (var V = !1, ma = !1, x = 0; x < ships.length; x++) "Colonial Ship" == ships[x].type && 0 < e.ships[x] && (V = !0);
                        game.searchPlanet(d) && (V = !1);
                        if (V) {
                            if (null != planets[d].civis) {
                                if (planets[d].civis != e.civis && planets[d].civis) {
                                    ma = !0;
                                    for (var y in planets[d].fleets) planets[d].fleets[y].civis == planets[d].civis && 0 != y && "hub" != y && (ma = !1)
                                }
                                ma || !game.searchPlanet(d) && planets[d].civis && (u = new z("conquer_button", "<span class='red_text'>Destroy enemy fleets before colonizing this planet!</span>",
                                    224, 40,
                                    function () {}))
                            }
                            l += u.getHtml()
                        }
                        game.searchPlanet(d) && 0 != b[1] && 0 < planets[d].structure[buildingsName.space_machine].number && (l += m.getHtml());
                        0 != b[1] && (l += na.getHtml(), l += aa.getHtml(), game.searchPlanet(d) && gameSettings.showHub && (4 <= game.planets.length || 0 < game.timeTravelNum) && (l += L.getHtml()));
                        0 != b[1] && game.searchPlanet(d) && (l += N.getHtml());
                        game.searchPlanet(d) && (0 != b[1] && (l += g.getHtml()), 0 != b[1] && (l += J.getHtml()));
                        0 != b[1] && (l += n.getHtml());
                        0 != b[1] && game.searchPlanet(d) && (l += Q.getHtml());
                        l += K.getHtml();
                        l += t.getHtml();
                        l += "</ul>";
                        document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = l);
                        currentFleetId = $(this).attr("name");
                        V && (ma ? (u.enable(), h("conquer_button", "<span class='red_text'>" + civis[planets[d].civis].name + "<br>will become hostile!</span>", 140)) : u.enable());
                        game.searchPlanet(d) && (0 != b[1] && (m.enable(), l = Math.ceil(e.totalWeight() / (1E5 * Math.sqrt(planets[d].structure[buildingsName.space_machine].number))), h("warp_button", "<span class='white_text'>Send this fleet to </span><span class='blue_text'>Solidad</span><br><span class='white_text'> with </span><span class='blue_text'>" +
                            beauty(l) + " antimatter</span>", 240)), 0 != b[1] && g.enable(), 0 != b[1] && J.enable());
                        0 != b[1] && n.enable();
                        0 != b[1] && game.searchPlanet(d) && (N.enable(), Q.enable());
                        K.enable();
                        0 != b[1] && (na.enable(), aa.enable(), game.searchPlanet(d) && L.enable());
                        t.enable();
                        0 != b[1] && T.enable()
                    } else l += K.getHtml(), l += "</ul>", document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = l), currentFleetId = $(this).attr("name"), K.enable()
                } else l += "</ul>", document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML =
                    l), currentFleetId = $(this).attr("name");
                for (x = 0; x < ships.length; x++) 0 < e.ships[x] && ($("#ship_name_infos_" + x).hover(function () {
                    var b = parseInt($(this).attr("name")),
                        d = currentFleetId.split("_");
                    d = planets[d[0]].fleets[d[1]];
                    var e = "<span class='blue_text'>Power: </span><span class='white_text'>" + beauty(ships[b].power) + "</span><br>";
                    e += "<span class='blue_text'>Weapon: </span><span class='white_text'>" + ships[b].weapon.capitalize() + "</span><br>";
                    e += "<span class='blue_text'>Armor: </span><span class='white_text'>" +
                        beauty(ships[b].armor) + "</span><br>";
                    e += "<span class='blue_text'>HPs: </span><span class='white_text'>" + beauty(ships[b].hp) + "</span><br>";
                    0 < ships[b].piercing && (e += "<span class='blue_text' style='float:left;margin-left:16px;'>Piercing Power: </span><span class='white_text'>" + Math.min(100, ships[b].piercing) + "%</span><br>");
                    0 < ships[b].shield && (e += "<span class='blue_text' style='float:left;margin-left:16px;'>Shields: </span><span class='white_text'>" + beauty(ships[b].shield) + "</span><br>");
                    e += "<span class='blue_text'>Dmg Reduction: </span><span class='white_text'>" +
                        Math.floor(100 * (100 - 100 / (1 + Math.log(1 + ships[b].armor * (1 + d.storage[resourcesName.armor.id] / (2 * mi)) / 1E4) / Math.log(2)))) / 100 + "%</span><br>";
                    e += "<span class='blue_text'>Speed: </span><span class='white_text'>" + Math.floor(100 * ships[b].speed * (1 + d.storage[resourcesName.engine.id] / 1E3 * 2E-4)) / 100 + "</span><br>";
                    e += "<span class='blue_text'>Weight: </span><span class='white_text'>" + beauty(ships[b].weight) + "</span><br>";
                    e += "<span class='blue_text'>Weight%: </span><span class='white_text'>" + Math.floor(ships[b].weight *
                        d.ships[b] / d.weight() * 1E4) / 100 + "%</span><br>";
                    (new v(140, 10, e, "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#ship_name_infos_" + x).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }), $("#ammo_bonus").hover(function () {
                    for (var b = currentFleetId.split("_"), d = planets[b[0]].fleets[b[1]], e = b = 0; e < ships.length; e++) b +=
                        ships[e].power * d.ships[e];
                    e = 10 * b * Math.log(1 + d.storage[resourcesName.ammunition.id] / (10 * mi)) / Math.log(2);
                    var h = 20 * b * Math.log(1 + d.storage[resourcesName["u-ammunition"].id] / (10 * mi)) / Math.log(2),
                        g = 60 * b * Math.log(1 + d.storage[resourcesName["t-ammunition"].id] / (20 * mi)) / Math.log(2);
                    d = 1 + .1 * Math.log(1 + d.ships[14]) / Math.log(2);
                    b = "<span class='blue_text'>Base Power: </span><span class='white_text'>" + beauty(b) + "</span><br>";
                    b += "<span class='blue_text'>Ammo Bonus: </span><span class='white_text'>+" + beauty(e) + "</span><br>";
                    b += "<span class='blue_text'>U-Ammo Bonus: </span><span class='white_text'>+" + beauty(h) + "</span><br>";
                    b += "<span class='blue_text'>T-Ammo Bonus: </span><span class='white_text'>+" + beauty(g) + "</span><br>";
                    b += "<span class='blue_text'>Admiral Bonus: </span><span class='white_text'>x" + beauty(d) + "</span><br>";
                    (new v(200, 10, b, "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX - 210,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX -
                            210,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#ammo_bonus").mouseout(function () {
                    $(document).on("mousemove", function () {})
                }))
            }))
        }
        currentUpdater = function () {};
        y();
        $("#ship_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(H);
        $("#back_button").show();
        game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(), $("#b_market_icon").hide()))
    }

    function U(b) {
        currentCriteriaAuto = b;
        fleetSchedule.fleetArrived = !1;
        currentUpdater = function () {};
        M(currentCriteria);
        "travelingShipInterface" != currentInterface && (document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = ""), document.getElementById("ship_info_name") && (document.getElementById("ship_info_name").innerHTML = ""));
        currentInterface = "travelingShipInterface";
        document.getElementById("ship_list") && (document.getElementById("ship_list").innerHTML = "");
        currentUpdater =
            function () {};
        var d = fleetSchedule.civisFleet(game.id);
        "market" == b && (d = fleetSchedule.marketFleets());
        for (var e = 0, h = "", g = 0; g < d.length; g++)
            if ("all" == b || "auto" != b && fleetSchedule.fleets[d[g].fleet].type == b || "market" == b && ("market_delivery" == fleetSchedule.fleets[d[g].fleet].type || "market_sell" == fleetSchedule.fleets[d[g].fleet].type) || "auto" == b && "auto" == fleetSchedule.fleets[d[g].fleet].type || "normal" == b && ("delivery" == fleetSchedule.fleets[d[g].fleet].type || ("qd" == fleetSchedule.fleets[d[g].fleet].type || "qn" ==
                    fleetSchedule.fleets[d[g].fleet].type) && gameSettings.showqd) || (d[g].origin == b || d[g].destination == b) && "auto" == fleetSchedule.fleets[d[g].fleet].type) {
                var l = !1,
                    u = "";
                if ("auto" == fleetSchedule.fleets[d[g].fleet].type) {
                    for (var w = fleetSchedule.fleets[d[g].fleet], m = d[g].origin, n = d[g].destination, K = parseInt(Math.floor(2 * planets[m].shortestPath[n].distance / (w.speed() * idleBon))), L = 0, t = 0, X = 0; X < resNum; X++) w.autoPct[X] ? 0 > planets[m].globalRaw[X] ? t += -w.autoRes[w.autoMap[m]][X] / 1E4 * planets[m].globalRaw[X] * K : L += w.autoRes[w.autoMap[m]][X] /
                        1E4 * planets[m].globalRaw[X] * K : L += w.autoRes[w.autoMap[m]][X], w.autoPct[X] ? 0 > planets[n].globalRaw[X] ? L += -w.autoRes[w.autoMap[n]][X] / 1E4 * planets[n].globalRaw[X] * K : t += w.autoRes[w.autoMap[n]][X] / 1E4 * planets[n].globalRaw[X] * K : t += w.autoRes[w.autoMap[n]][X];
                    L = Math.floor(L);
                    t = Math.floor(t);
                    L > w.maxStorage() && (l = !0, u += "<span class='red_text' style='font-size:70%;'> (Not enough storage in " + planets[m].name);
                    t > w.maxStorage() && (u = l ? u + (" and " + planets[n].name) : u + ("<span class='red_text' style='font-size:70%;'> (Not enough storage in " +
                        planets[n].name), l = !0);
                    l && (u += ") </span>")
                }
                h += "<li id='travel" + d[g].fleet + "' name='" + g + "_" + d[g].fleet + "' style='height:96px;' class='button'>";
                h += "<div style='width:98%; height:120px;position:relative;'>";
                h += "<div style='position:relative; top:8px; left:8px'>";
                l = "red_text";
                w = "[Enemy] ";
                game.id == fleetSchedule.fleets[d[g].fleet].civis ? (l = "blue_text", w = "") : game.reputation[fleetSchedule.fleets[d[g].fleet].civis] >= repLevel.allied.min ? (l = "green_text", w = "[Allied] ") : game.reputation[fleetSchedule.fleets[d[g].fleet].civis] >=
                    repLevel.friendly.min ? (l = "white_text", w = "[Friendly] ") : game.reputation[fleetSchedule.fleets[d[g].fleet].civis] >= repLevel.neutral.min && (l = "gray_text", w = "[Neutral] ");
                h += "<span class='" + l + "' style='font-size: 100%;'>" + w + fleetSchedule.fleets[d[g].fleet].name + "</span>" + u;
                h += "<img id='b_rename_travel_icon_" + d[g].fleet + "' name='" + d[g].fleet + "' src='ui/RENAME.png' style='width:16px;height:16px;position:relative;top:3px;cursor:pointer;'/>";
                h += "<span class='white_text'> traveling to </span><span class='blue_text' style='font-size: 100%;cursor:pointer;' id='traveling_" +
                    d[g].destination + "_" + g + "' name='" + d[g].destination + "'>" + planets[d[g].destination].name + "</span>";
                u = d[g].lastPlanet;
                h += "<span class='white_text'> (last seen in </span><span class='blue_text' style='font-size: 100%;cursor:pointer;' id='lastseen_" + u + "_" + g + "' name='" + u + "'>" + planets[d[g].lastPlanet].name + "</span><span class='white_text'>)</span>";
                K = d[g].departureTime + (d[g].totalTime - d[g].departureTime) / idleBon - (new Date).getTime();
                0 > K && (K = 0);
                u = Math.floor(K / 1E3);
                l = Math.floor(u / 60);
                h += "<span class='white_text'> will arrive in: </span><span class='blue_text' id='ship_time_" +
                    d[g].fleet + "'>" + Math.floor(l / 60) % 60 + "h " + l % 60 + "m " + u % 60 + "s</span>";
                h += "</div>";
                m = d[g].hop;
                u = shortestRouteId(d[g].origin, d[g].destination);
                l = u.length - 2;
                w = 100 * ((new Date).getTime() - d[g].departureTime) / (d[g].arrivalTime - d[g].departureTime) * idleBon;
                100 < w && (w = 100);
                h += "<div style='position:relative;top:32px;'><div style='width:400px;height:12px;background-color:rgba(75, 129, 156, 0.3);position:relative;left:20px;top:-8px'></div>";
                h += "<div id='q" + d[g].fleet + "' style='max-width:400px;width:" + Math.floor(400 *
                    m / l + 4 * w / l) + "px;height:12px;background-color: rgba(100,152,208,0.3);position:relative;top:-20px;left:20px;'></div>";
                for (m = 0; m < u.length - 1; m++) h += "<img id='qplanet" + d[g].fleet + "_" + m + "' src='img/" + planets[u[m + 1]].icon + "/" + planets[u[m + 1]].icon + ".png' style='width:30px;height:30px;position:relative;top:-40px;left:" + Math.floor(400 * m / l - 30 * m - 4) + "px;'></img>";
                "auto" == d[g].type && (h += "<div class='blue_text' style='position:relative; top:-72px; left:480px; font-size: 80%;cursor:pointer;width:100%' id='autoroute_overview_" +
                    d[g].fleet + "_" + g + "' name='exp_" + d[g].fleet + "_" + d[g].origin + "_" + d[g].destination + "' >Show resources<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></div>", h += "<div class='blue_text' style='position:relative; top:-56px; left:15%;width:70%; font-size: 80%;cursor:pointer;' id='autoroute_resources_" + d[g].fleet + "'></div>");
                u = parseInt(w);
                100 < u && (u = 100);
                h += "</div>";
                h += "</div></li>";
                e++
            }
        0 == e && (h += "<li id='nofleet' style='height:120px;' class='button'>", h +=
            "<div style='width:98%; height:120px;position:relative;'>", h += "<div style='text-align:center;position:relative; top:8px; left:8px'>", h += "<span class='gray_text' style='font-size: 100%;'>There are no fleets to show</span> ", h += "</li>");
        document.getElementById("ship_list") && (document.getElementById("ship_list").innerHTML = h);
        for (g = 0; g < d.length; g++)
            if ("all" == b || "auto" != b && fleetSchedule.fleets[d[g].fleet].type == b || "market" == b && ("market_delivery" == fleetSchedule.fleets[d[g].fleet].type || "market_sell" == fleetSchedule.fleets[d[g].fleet].type) ||
                "auto" == b && "auto" == fleetSchedule.fleets[d[g].fleet].type || "normal" == b && ("delivery" == fleetSchedule.fleets[d[g].fleet].type || ("qd" == fleetSchedule.fleets[d[g].fleet].type || "qn" == fleetSchedule.fleets[d[g].fleet].type) && gameSettings.showqd) || (d[g].origin == b || d[g].destination == b) && "auto" == fleetSchedule.fleets[d[g].fleet].type) e = d[g].destination, u = d[g].lastPlanet, $("#traveling_" + e + "_" + g).unbind(), $("#traveling_" + e + "_" + g).click(function () {
                var b = parseInt($(this).attr("name"));
                A(planets[b])
            }), $("#lastseen_" +
                u + "_" + g).unbind(), $("#lastseen_" + u + "_" + g).click(function () {
                var b = parseInt($(this).attr("name"));
                A(planets[b])
            }), $("#travel" + d[g].fleet).unbind(), $("#travel" + d[g].fleet).click(function () {
                var e = $(this).attr("name").split("_"),
                    g = parseInt(e[1]);
                e = parseInt(e[0]);
                "auto" == fleetSchedule.fleets[g].type ? $("#ship_info_name").html(fleetSchedule.fleets[g].name + "<br><span class='white_text' style='font-size:70%'>(Automatic Transport)</span>") : "delivery" == fleetSchedule.fleets[g].type ? $("#ship_info_name").html(fleetSchedule.fleets[g].name +
                    "<br><span class='white_text' style='font-size:70%'>(Resource Delivery)</span>") : $("#ship_info_name").html(fleetSchedule.fleets[g].name);
                var l = "<ul id='ship_info_list' style='position:absolute; text-align:right; top:48px; margin-top:16px; clear:both;'><div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Information</span><br><br>";
                h += "<span class='blue_text' style='float:left;margin-left:16px;'>Military Value: </span><span class='white_text' >" +
                    beauty(fleetSchedule.fleets[g].value()) + "</span><br>";
                h += "<span class='blue_text' style='float:left;margin-left:16px;'>Experience: </span><span class='white_text' >" + beauty(fleetSchedule.fleets[g].exp) + "</span><br>";
                l += "<span class='blue_text' style='float:left;margin-left:16px;' id='ammo_bonus_t' name='" + g + "'>Total Power: </span><span class='white_text'>" + beauty(fleetSchedule.fleets[g].power()) + "</span><br>";
                l += "<span class='blue_text' style='float:left;margin-left:16px;'>Total Armor: </span><span class='white_text'>" +
                    beauty(fleetSchedule.fleets[g].armor()) + "</span><br>";
                l += "<span class='blue_text' style='float:left;margin-left:16px;'>Total HP: </span><span class='white_text'>" + beauty(fleetSchedule.fleets[g].hp()) + "</span><br>";
                l += "<span class='blue_text' style='float:left;margin-left:16px;'>Speed: </span><span class='white_text'>" + Math.floor(100 * fleetSchedule.fleets[g].speed()) / 100 + "</span><br>";
                l += "<span class='blue_text' style='float:left;margin-left:16px;'>Total Storage: </span><span class='white_text'>" + beauty(fleetSchedule.fleets[g].maxStorage()) +
                    "</span><br>";
                var u = (d[e].totalTime - d[e].departureTime) / idleBon;
                0 > u && (u = 0);
                u = Math.floor(u / 1E3);
                var w = Math.floor(u / 60);
                l = l + ("<span class='blue_text' style='float:left;margin-left:16px;'>Total Travel Time: </span><span class='white_text'>" + Math.floor(w / 60) % 60 + "h " + w % 60 + "m " + u % 60 + "s</span><br>") + "</div><br>";
                u = 512;
                l = l + "<div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Storage</span><br><br>" + ("<span class='blue_text' style='float:left;margin-left:16px;'>Storage left: </span><span class='white_text'>" +
                    beauty(parseInt(Math.floor(fleetSchedule.fleets[g].availableStorage()))) + "</span><br>");
                for (w = 0; w < resNum; w++) 0 < fleetSchedule.fleets[g].storage[w] && (l += "<span class='blue_text' style='float:left;margin-left:16px;'>" + resources[w].name.capitalize() + ": </span><span class='white_text'>" + parseInt(Math.floor(fleetSchedule.fleets[g].storage[w])) + "</span><br>", u += 16);
                l += "</div><br><div style='position:relative; left:8px;'><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Ships</span><br><br>";
                for (w = 0; w < ships.length; w++) 0 < fleetSchedule.fleets[g].ships[w] && (l += "<span class='blue_text' style='float:left;margin-left:16px;' id='ship_name_infos_t_" + w + "' name='" + g + "_" + w + "'>" + ships[w].name + "</span><span class='white_text'>" + fleetSchedule.fleets[g].ships[w] + "</span><br>", u += 16);
                l += "</div><br><br>";
                if ("auto" == fleetSchedule.fleets[g].type) {
                    w = new z("autocnc_button", "Cancel automatic route", 224, 40, function () {
                        var d = $(this).attr("name").split("_"),
                            e = parseInt(d[1]);
                        parseInt(d[0]);
                        fleetSchedule.fleets[e].type =
                            "normal";
                        (new v(210, 0, "<span class='blue_text text_shadow'>Route canceled</span>", "info")).drawToast();
                        U(b)
                    });
                    var m = new z("autoedit_button", "Edit automatic route", 224, 40, function () {
                            var b = $(this).attr("name").split("_"),
                                e = parseInt(b[1]);
                            b = parseInt(b[0]);
                            W(fleetSchedule.fleets[e], d[b].origin, d[b].destination)
                        }),
                        n = new z("autodiv_button", "Split automatic route", 224, 40, function () {
                            var b = $(this).attr("name").split("_"),
                                d = parseInt(b[1]);
                            parseInt(b[0]);
                            b = fleetSchedule.fleets[d];
                            for (var e = d = 0; e < ships.length; e++) 0 <
                                b.ships[e] && d++;
                            (new v(420, Math.min(64 + 20 * d, 240), "<br><span class='blue_text text_shadow'>Select the number of ships</span><br>", "autoDivide", b)).draw()
                        });
                    l += m.getHtml();
                    l += n.getHtml();
                    l += w.getHtml();
                    l += "</ul>";
                    document.getElementById("ship_info_list") && (document.getElementById("ship_info_list").innerHTML = l);
                    w.enable();
                    n.enable();
                    m.enable();
                    $("#autocnc_button").attr("name", e + "_" + g);
                    $("#autoedit_button").attr("name", e + "_" + g);
                    $("#autodiv_button").attr("name", e + "_" + g)
                } else w = new z("cancel_travel_button",
                        "Cancel Travel", 224, 40,
                        function () {
                            var e = d[parseInt($(this).attr("name"))].fleet,
                                g = fleetSchedule.fleets[e];
                            if (fleetSchedule.fleets[e]) {
                                for (var h = 1; planets[g.lastPlanet].fleets[h];) h++;
                                planets[g.lastPlanet].fleets[h] = fleetSchedule.fleets[e];
                                fleetSchedule.fleets[e] = null
                            } else(new v(210, 0, "<span class='red_text red_text_shadow'>This fleet doesn't exist!</span>", "info")).drawToast();
                            U(b)
                        }), fleetSchedule.fleets[d[e].fleet].civis == game.id && (l += w.getHtml()), l += "</ul>", document.getElementById("ship_info_list") &&
                    (document.getElementById("ship_info_list").innerHTML = l), fleetSchedule.fleets[d[e].fleet].civis == game.id && (w.enable(), $("#cancel_travel_button").attr("name", e));
                for (w = 0; w < ships.length; w++) 0 < fleetSchedule.fleets[g].ships[w] && ($("#ship_name_infos_t_" + w).hover(function () {
                    var b = $(this).attr("name").split("_"),
                        d = parseInt(b[1]);
                    b = fleetSchedule.fleets[b[0]];
                    var e = "<span class='blue_text'>Power: </span><span class='white_text'>" + beauty(ships[d].power) + "</span><br>";
                    e += "<span class='blue_text'>Weapon: </span><span class='white_text'>" +
                        ships[d].weapon.capitalize() + "</span><br>";
                    e += "<span class='blue_text'>Armor: </span><span class='white_text'>" + beauty(ships[d].armor) + "</span><br>";
                    e += "<span class='blue_text'>HPs: </span><span class='white_text'>" + beauty(ships[d].hp) + "</span><br>";
                    0 < ships[d].piercing && (e += "<span class='blue_text' style='float:left;margin-left:16px;'>Piercing Power: </span><span class='white_text'>" + Math.min(100, ships[d].piercing) + "%</span><br>");
                    e += "<span class='blue_text'>Dmg Reduction: </span><span class='white_text'>" +
                        Math.floor(100 * (100 - 100 / (1 + Math.log(1 + ships[d].armor * (1 + b.storage[resourcesName.armor.id] / (2 * mi)) / 1E4) / Math.log(2)))) / 100 + "%</span><br>";
                    e += "<span class='blue_text'>Speed: </span><span class='white_text'>" + Math.floor(100 * ships[d].speed * (1 + b.storage[resourcesName.engine.id] / 1E3 * 2E-4)) / 100 + "</span><br>";
                    e += "<span class='blue_text'>Weight: </span><span class='white_text'>" + beauty(ships[d].weight) + "</span><br>";
                    e += "<span class='blue_text'>Weight%: </span><span class='white_text'>" + Math.floor(ships[d].weight *
                        b.ships[d] / b.weight() * 1E4) / 100 + "%</span><br>";
                    (new v(140, 10, e, "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                }), $("#ship_name_infos_t_" + w).mouseout(function () {
                    $(document).on("mousemove", function () {})
                }));
                $("#ammo_bonus_t").hover(function () {
                    for (var b = fleetSchedule.fleets[$(this).attr("name")], d = 0, e = 0; e < ships.length; e++) d += ships[e].power *
                        b.ships[e];
                    e = 10 * d * Math.log(1 + b.storage[resourcesName.ammunition.id] / (10 * mi)) / Math.log(2);
                    var g = 20 * d * Math.log(1 + b.storage[resourcesName["u-ammunition"].id] / (10 * mi)) / Math.log(2),
                        h = 60 * d * Math.log(1 + b.storage[resourcesName["t-ammunition"].id] / (20 * mi)) / Math.log(2);
                    b = 1 + .1 * Math.log(1 + b.ships[14]) / Math.log(2);
                    d = "<span class='blue_text'>Base Power: </span><span class='white_text'>" + beauty(d) + "</span><br>";
                    d += "<span class='blue_text'>Ammo Bonus: </span><span class='white_text'>+" + beauty(e) + "</span><br>";
                    d +=
                        "<span class='blue_text'>U-Ammo Bonus: </span><span class='white_text'>+" + beauty(g) + "</span><br>";
                    d += "<span class='blue_text'>T-Ammo Bonus: </span><span class='white_text'>+" + beauty(h) + "</span><br>";
                    d += "<span class='blue_text'>Admiral Bonus: </span><span class='white_text'>x" + beauty(b) + "</span><br>";
                    (new v(200, 10, d, "info")).drawInfo();
                    $(document).on("mousemove", function (b) {
                        mouseX = b.pageX + 10;
                        mouseY = b.pageY + 10;
                        $("#popup_info").css({
                            left: mouseX - 210,
                            top: mouseY
                        })
                    });
                    $("#popup_info").css({
                        left: mouseX - 210,
                        top: mouseY
                    })
                }, function () {
                    currentPopup.drop()
                });
                $("#ammo_bonus_t").mouseout(function () {
                    $(document).on("mousemove", function () {})
                });
                $("#ship_infolist_placeholder").css("height", u + "px")
            }), $("#b_rename_travel_icon_" + d[g].fleet).click(function () {
                var b = fleetSchedule.fleets[parseInt($(this).attr("name"))];
                (new v(360, 140, "<br><span class='blue_text text_shadow'>Type the new name</span><br>", "renameFleetTravel", b)).draw()
            }), "auto" == fleetSchedule.fleets[d[g].fleet].type && ($("#autoroute_overview_" + d[g].fleet +
                "_" + g).unbind(), $("#autoroute_overview_" + d[g].fleet + "_" + g).click(function () {
                var b = $(this).attr("name").split("_"),
                    d = b[0],
                    e = parseInt(b[1]),
                    g = parseInt(b[2]);
                b = parseInt(b[3]);
                if ("exp" == d) {
                    d = 96;
                    var h = fleetSchedule.fleets[e],
                        l = parseInt(Math.floor(2 * planets[g].shortestPath[b].distance / h.speed()));
                    var u = "<div style='position:relative;left:16px;'><div style='float:left;margin:0;width:48%;'>" + ("<img src='img/" + planets[g].icon + "/" + planets[g].icon + ".png' style='cursor:pointer;position:relative;top:8px;height:24px;width:24px;'/><span class='blue_text' style='font-size:90%'> " +
                        planets[g].name + "</span><br>");
                    d += 64;
                    for (var w = 0, m = 0; m < resNum; m++)
                        if (h.autoPct[m]) {
                            var n = 0;
                            0 > planets[b].globalRaw[m] && (n -= planets[b].globalRaw[m] * h.autoRes[h.autoMap[b]][m] / 1E4);
                            0 < planets[g].globalRaw[m] && (n += planets[g].globalRaw[m] * h.autoRes[h.autoMap[g]][m] / 1E4);
                            u += "<br><span class='blue_text' style='font-size:90%;'>" + resources[m].name.capitalize() + ": </span><span class='white_text' style='font-size:100%;'>" + beauty(n * l) + " </span><span class='blue_text'>(" + beauty(n) + "/s, " + h.autoRes[h.autoMap[g]][m] /
                                100 + "%)</span>";
                            w += 22
                        } else 0 < h.autoRes[h.autoMap[g]][m] && (u += "<br><span class='blue_text' style='font-size:90%;'>" + resources[m].name.capitalize() + ": </span><span class='white_text' style='font-size:100%;'>" + beauty(h.autoRes[h.autoMap[g]][m]) + " </span><span class='blue_text'>(" + beauty(h.autoRes[h.autoMap[g]][m] / l) + "/s)</span>", w += 22);
                    u = u + "</div><div style='position:relative;left:16px;'><div style='float:left;margin:0;width:48%;'>" + ("<img src='img/" + planets[b].icon + "/" + planets[b].icon + ".png' style='cursor:pointer;position:relative;top:8px;height:24px;width:24px;'/><span class='blue_text' style='font-size:90%'> " +
                        planets[b].name + "</span><br>");
                    for (m = 0; m < resNum; m++) h.autoPct[m] ? (n = 0, 0 > planets[g].globalRaw[m] && (n -= planets[g].globalRaw[m] * h.autoRes[h.autoMap[g]][m] / 1E4), 0 < planets[b].globalRaw[m] && (n += planets[b].globalRaw[m] * h.autoRes[h.autoMap[b]][m] / 1E4), u += "<br><span class='blue_text' style='font-size:90%;'>" + resources[m].name.capitalize() + ": </span><span class='white_text' style='font-size:100%;'>" + beauty(n * l) + " </span><span class='blue_text'>(" + beauty(n) + "/s, " + h.autoRes[h.autoMap[b]][m] / 100 + "%)</span>",
                        w += 22) : 0 < h.autoRes[h.autoMap[b]][m] && (u += "<br><span class='blue_text' style='font-size:90%;'>" + resources[m].name.capitalize() + ": </span><span class='white_text' style='font-size:100%;'>" + beauty(h.autoRes[h.autoMap[b]][m]) + " </span><span class='blue_text'>(" + beauty(h.autoRes[h.autoMap[b]][m] / l) + "/s)</span>", w += 22);
                    u += "</div></div>";
                    h = w;
                    0 > w && (h = 0);
                    d += h;
                    document.getElementById("autoroute_resources_" + e) && (document.getElementById("autoroute_resources_" + e).innerHTML = u);
                    $("#travel" + e).css("height", d + "px");
                    this.innerHTML = "Hide resources<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                    $(this).attr("name", "hide_" + e + "_" + g + "_" + b)
                } else this.innerHTML = "Show resources<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp_" + e + "_" + g + "_" + b), document.getElementById("autoroute_resources_" + e) && (document.getElementById("autoroute_resources_" + e).innerHTML = ""), $("#travel" + e).css("height", "96px")
            }));
        currentUpdater = function () {
            var d = fleetSchedule.civisFleet(game.id);
            "market" == b && (d = fleetSchedule.marketFleets());
            for (var e = 0; e < d.length; e++)
                if ("all" == b || "auto" != b && fleetSchedule.fleets[d[e].fleet].type == b || "market" == b && ("market_delivery" == fleetSchedule.fleets[d[e].fleet].type || "market_sell" == fleetSchedule.fleets[d[e].fleet].type) || "auto" == b && "auto" == fleetSchedule.fleets[d[e].fleet].type || "normal" == b && ("delivery" == fleetSchedule.fleets[d[e].fleet].type || ("qd" == fleetSchedule.fleets[d[e].fleet].type ||
                        "qn" == fleetSchedule.fleets[d[e].fleet].type) && gameSettings.showqd) || (d[e].origin == b || d[e].destination == b) && "auto" == fleetSchedule.fleets[d[e].fleet].type) {
                    var g = d[e].hop,
                        h = shortestRouteId(d[e].origin, d[e].destination).length - 2,
                        l = d[e].departureTime + (d[e].totalTime - d[e].departureTime) / idleBon - (new Date).getTime();
                    0 > l && (l = 0);
                    l = Math.floor(l / 1E3);
                    var u = Math.floor(l / 60),
                        w = Math.floor(u / 60);
                    document.getElementById("ship_time_" + d[e].fleet) && (document.getElementById("ship_time_" + d[e].fleet).innerHTML = "" + w % 60 +
                        "h " + u % 60 + "m " + l % 60 + "s");
                    l = 100 * ((new Date).getTime() - d[e].departureTime) / (d[e].arrivalTime - d[e].departureTime) * idleBon;
                    100 < l && (l = 100);
                    $("#q" + d[e].fleet).css("width", "" + Math.floor(400 * g / h + 4 * l / h) + "px");
                    100 < parseInt(l) && U(b)
                }
        };
        game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_shipyard_icon").show()) : (1 <= game.researches[3].level && $("#b_shipyard_icon").show(), $("#b_market_icon").hide()))
    }

    function ja(b) {
        currentInterface = "marketInterface";
        currentPlanet = b;
        currentUpdater = function () {};
        for (var d = Array(resNum), e = 0; e < resNum; e++) d[e] = e;
        gameSettings.sortResName && (d = sortObjIndex(resources, "name"));
        for (var g = "", h = 0; h < resNum; h++)
            if (e = d[h], resources[e].show(game)) {
                for (var l = 0, m = 0, w = 0, u = 0, n = "", K = "", L = 0; L < civis.length; L++) l += civis[L].marketExport(e), 0 < civis[L].marketExport(e) && (w++, n += ", " + civis[L].shortName), m += civis[L].marketImport(e), 0 < civis[L].marketImport(e) && (u++, K += ", " + civis[L].shortName);
                g += "<li id='market" + e + "' name='" + e + "' style='height:132px;'>";
                g += "<div style='width:98%; height:80px;position:relative;'>";
                g += "<div style='position:relative; top:8px; left:8px'>";
                g += "<span class='blue_text' style='font-size: 120%;'>" + resources[e].name.capitalize() + " </span>";
                L = "<span class='red_text'> (~ ";
                0 < l - m ? L = "<span class='green_text'> (~ +" : 0 == l - m && (L = "<span class='gray_text'> (~ ");
                g += "<span class='white_text' id='market" + e + "stock'>\t" + beauty(market.stock[e]) + "/" + beauty(market.maxStock[e]) + "" + L + "" + beauty(l - m) + "/s)</span></span>";
                0 < w && (g += "<br><span class='blue_text' style='font-size: 80%;'> Exported by: </span><span class='white_text' style='font-size: 80%;'>" +
                    n.substring(2) + "</span>");
                0 < u && (g += "<br><span class='blue_text' style='font-size: 80%;'> Imported by: </span><span class='white_text' style='font-size: 80%;'>" + K.substring(2) + "</span>");
                g += "</div>";
                g += "<div style='position:relative; top:8px; left:8px'><br>";
                g += "<span class='blue_text' style='font-size: 80%;'>Buy Price (1000 units): </span> ";
                g += "<span class='white_text' style='font-size: 80%;' id='market" + e + "bp'>" + beauty(1E3 * market.buyPrice(e, game)) + "</span>";
                g += "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>";
                g += "<span style='position:relative;left:64px;'>";
                g += "<input id='market_buy_" + e + "' name='" + e + "' type='text' value='0' style='width:80px;height:12px;font-size:80%;'/>";
                g += "<span class='red_text' style='font-size: 80%;' id='totalbuy_" + e + "'>  -0</span><img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>";
                g += "</span>";
                g += "<br>";
                g += "<span class='blue_text' style='font-size: 80%;'>Sell Price (1000 units): </span> ";
                g += "<span class='white_text' style='font-size: 80%;' id='market" +
                    e + "sp'>" + beauty(1E3 * market.sellPrice(e, game)) + "</span>";
                g += "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>";
                g += "<span style='position:relative;left:64px;'>";
                g += "<input id='market_sell_" + e + "' name='" + e + "' type='text' value='0' style='width:80px;height:12px;font-size:80%;'/>";
                g += "<span class='green_text' style='font-size: 80%;' id='totalsell_" + e + "'>  +0</span><img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>";
                g += "</span>";
                g += "</div>";
                g += "</div></li>"
            }
        document.getElementById("market_list") && (document.getElementById("market_list").innerHTML = g);
        var t = 0;
        for (e in b.fleets) 0 != e && "hub" != e && b.fleets[e] && b.fleets[e].civis == game.id && 0 < b.fleets[e].shipNum() && (t += b.fleets[e].maxStorage());
        for (d = 0; d < resNum; d++) resources[d].show(game) && ($("#market_buy_" + d).change(function () {
            $(this).val(parseInt($(this).val()));
            Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > market.stock[parseInt($(this).attr("name"))] && $(this).val(market.stock[parseInt($(this).attr("name"))]) :
                $(this).val(0);
            $("#totalbuy_" + $(this).attr("name")).html("  -" + beauty(parseInt($(this).val()) * market.buyPrice($(this).attr("name"), game)));
            for (var b = 0, d = 0; d < resNum; d++) resources[d].show(game) && (b += parseInt($("#market_buy_" + d).val()) * market.buyPrice(d, game));
            document.getElementById("buy_total") && (document.getElementById("buy_total").innerHTML = "  (-" + beauty(b) + "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>)")
        }), $("#market_sell_" + d).change(function () {
            var b = market.maxStock[parseInt($(this).attr("name"))] -
                market.stock[parseInt($(this).attr("name"))];
            if (parseInt($(this).val()) > b) {
                var d = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough space in the market!</span>", "info");
                d.drawToast();
                $(this).val(b)
            } else $(this).val(parseInt($(this).val()));
            d = t;
            for (b = 0; b < resNum; b++) resources[b].show(game) && b != parseInt($(this).attr("name")) && (d -= parseInt($("#market_sell_" + b).val()));
            Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > d && ($(this).val(Math.max(0, d)), d = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough fleet storage!</span>",
                "info"), d.drawToast()) : $(this).val(0);
            $("#totalsell_" + $(this).attr("name")).html("  +" + beauty(parseInt($(this).val()) * market.sellPrice($(this).attr("name"), game)));
            for (b = d = 0; b < resNum; b++) resources[b].show(game) && (d += parseInt($("#market_sell_" + b).val()) * market.sellPrice(b, game));
            document.getElementById("sell_total") && (document.getElementById("sell_total").innerHTML = "  (+" + beauty(d) + "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>)")
        }));
        d = "<ul id='market_mini_list' style='position:absolute; text-align:left; top:0px; clear:both;'><div style='position:relative; left:8px;'>" +
            ("<span class='blue_text'>Energy Prod.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(b.energyProduction()) + "</span><br>");
        d += "<span class='blue_text'>Energy Cons.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(-b.energyConsumption()) + "</span><br>";
        e = Math.floor(b.energyProduction() + b.energyConsumption());
        h = b.energyMalus();
        1 < h ? h = 1 : 0 > h && (h = 0);
        l = "green_text";.85 <= h && 1 > h ? l = "gold_text" : .85 > h && (l = "red_text");
        d += "<span class='blue_text'>Balance: </span><span class='" +
            l + "' style='float:right;margin-right:20%;'>" + parseInt(Math.floor(e)) + "</span><br>";
        d += "<span class='blue_text'>Efficiency: </span><span class='" + l + "' style='float:right;margin-right:20%;'>" + Math.floor(1E4 * h) / 100 + "%</span><br><br>";
        gameSettings.populationEnabled && (d += "<span class='blue_text'>Population Growth: </span><span id='popGrow' class='white_text' style='float:right;margin-right:20%;'>" + 100 * b.basePopulation + "%" + (0 < b.structure[buildingsName.clonation].number ? "<span class='green_text'>(+" + b.structure[buildingsName.clonation].number +
                "%)</span>" : "") + "/y</span><br>", d += "<span class='blue_text'>Population: </span><span class='white_text' style='float:right;margin-right:20%;' id='popul'>" + beauty(b.population) + " " + (0 < b.globalProd.population + b.populationRatio ? "<span class='green_text'>(+" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>") + "</span><br>", d += "<span class='blue_text'>Habitable Space: </span><span class='white_text' style='float:right;margin-right:20%;' id='habitable'>" +
            beauty(b.habitableSpace()) + "</span><br><br>");
        d += uiScheduler.planetResources(b);
        d += "</div></ul>";
        document.getElementById("market_mini_list") && (document.getElementById("market_mini_list").innerHTML = d);
        g = "";
        for (d = h = e = 0; d < resNum; d++) resources[d].show(game) && (e += parseInt($("#market_buy_" + d).val()), h += parseInt($("#market_sell_" + d).val()));
        document.getElementById("market_info_name") && (document.getElementById("market_info_name").innerHTML = "<span class='blue_text' style='font-size:80%;'>Total available storage of orbiting fleets: </span><span class='white_text' style='font-size:60%;'>" +
            beauty(t) + "</span><br><br><div class='button'><span class='blue_text' style='font-size:100%;width:100%;cursor:pointer;' id='market_buy_button'>Buy</span><span class='red_text' style='font-size:60%;' id='buy_total'>  (-" + beauty(e) + "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>)</span></div><br><div class='button'><span class='blue_text' style='font-size:100%;width:100%;cursor:pointer;' id='market_sell_button'>Sell</span><span class='green_text' style='font-size:60%;' id='sell_total'>  (+" +
            beauty(h) + "<img src='ui/coin.png' style='height:16px;width:16px;position:relative;top:4px;'/>)</span></div>");
        $("#market_buy_button").unbind();
        $("#market_buy_button").click(function () {
            for (var b = new Fleet(8, "Market Delivery"), d = 0, e = 0, g = 0; g < resNum; g++) resources[g].show(game) && (d += parseInt($("#market_buy_" + g).val()), b.storage[g] = parseInt($("#market_buy_" + g).val()), e += parseInt($("#market_buy_" + g).val()) * market.buyPrice(g, game));
            b.ships[71] = 1 + Math.floor(d / ships[71].maxStorage);
            b.type = "market_delivery";
            if (0 < d)
                if (game.money >= e) {
                    game.money -= e;
                    0 > game.money && (game.money = 0);
                    if (currentPlanet.id != planetsName.virgo) {
                        g = b.move(planetsName.virgo, currentPlanet.id);
                        d = 0;
                        60 <= g ? d = "" + parseInt(Math.floor(g / 60)) + " minutes and " + parseInt(Math.floor(g % 60)) + " seconds" : 0 > g ? (g = new v(210, 0, "<span class='red_text red_text_shadow'>Already on this planet!</span>", "info"), g.drawToast()) : d = "" + parseInt(Math.floor(g)) + " seconds";
                        for (g = 0; g < resNum; g++) resources[g].show(game) && (market.stock[g] -= b.storage[g], 0 > market.stock[g] && (market.stock[g] =
                            0));
                        ja(currentPlanet);
                        g = new v(210, 110, "<br><span class='blue_text text_shadow'>The delivery will arrive in " + d + "</span>", "Ok")
                    } else {
                        for (g = 0; g < resNum; g++) resources[g].show(game) && (market.stock[g] -= b.storage[g], 0 > market.stock[g] && (market.stock[g] = 0));
                        b.unload(currentPlanet.id);
                        g = new v(210, 110, "<br><span class='blue_text text_shadow'>Resources bought</span>", "Ok")
                    }
                    g.draw()
                } else g = new v(210, 0, "<span class='red_text red_text_shadow'>You don't have enough coins!</span>", "info"), g.drawToast();
            else g = new v(210,
                0, "<span class='red_text red_text_shadow'>Your resource request is empty</span>", "info"), g.drawToast()
        });
        $("#market_sell_button").unbind();
        $("#market_sell_button").click(function () {
            for (var d = 0, e = !1, g = !1, h = 0; h < resNum; h++)
                if (resources[h].show(game) && (d += parseInt($("#market_sell_" + h).val()), parseInt($("#market_sell_" + h).val()) > market.maxStock[h] - market.stock[h] && (g = !0), parseInt($("#market_sell_" + h).val()) > currentPlanet.resources[h])) {
                    e = !0;
                    break
                }
            var l = "";
            g && (l = "<br><span class='red_text'>Though the market won't accept everything</span>");
            if (e) l = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough resources on the planet</span>", "info");
            else if (0 < d) {
                h = 0;
                for (var w in b.fleets) 0 != w && b.fleets[w] && b.fleets[w].civis == game.id && 0 < b.fleets[w].shipNum() && (h += b.fleets[w].maxStorage());
                if (d <= h) {
                    h = !1;
                    e = 0;
                    for (w in currentPlanet.fleets)
                        if (0 != w && "hub" != w && currentPlanet.fleets[w] && currentPlanet.fleets[w].civis == game.id && 0 < currentPlanet.fleets[w].shipNum() && currentPlanet.fleets[w].maxStorage() >= d) {
                            e = w;
                            h = !0;
                            break
                        }
                    if (h) {
                        currentPlanet.fleets[e].type =
                            "market_sell";
                        currentPlanet.fleets[e].unload(currentPlanet.id);
                        for (h = 0; h < resNum; h++) resources[h].show(game) && (d = parseInt($("#market_sell_" + h).val()), currentPlanet.fleets[e].load(h, d) && currentPlanet.resourcesAdd(h, -d));
                        planetsName.virgo != currentPlanet.id ? (currentPlanet.fleets[e].move(currentPlanet.id, planetsName.virgo), delete currentPlanet.fleets[e], ja(currentPlanet), l = new v(210, 0, "<span class='blue_text'>Fleet sent</span>" + l, "info")) : (market.sell(currentPlanet.fleets[e]), l = new v(210, 0, "<span class='blue_text'>Resources Sold</span>" +
                            l, "info"))
                    } else l = new v(210, 0, "<span class='blue_text'>You don't have a fleet big enough to carry the resources</span>", "info")
                } else l = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough fleets available in orbit to carry the resources</span>", "info")
            } else l = new v(210, 0, "<span class='red_text red_text_shadow'>Empty resources request</span>", "info");
            l.drawToast()
        });
        document.getElementById("market_info_list") && (document.getElementById("market_info_list").innerHTML = g);
        for (e = 0; e < resNum; e++) resources[e].show(game) &&
            ($("#market" + e).valore = e, $("#market" + e).click(function () {}));
        currentUpdater = function () {
            var d = "<ul id='market_mini_list' style='position:absolute; text-align:left; top:0px; clear:both;'><div style='position:relative; left:8px;'>" + ("<span class='blue_text'>Energy Prod.: </span><span class='white_text' style='float:right;margin-right:20%;'>" + Math.floor(b.energyProduction()) + "</span><br>");
            d += "<span class='blue_text'>Energy Cons.: </span><span class='white_text' style='float:right;margin-right:20%;'>" +
                Math.floor(-b.energyConsumption()) + "</span><br>";
            var e = Math.floor(b.energyProduction() + b.energyConsumption()),
                h = b.energyMalus();
            1 < h ? h = 1 : 0 > h && (h = 0);
            var l = "green_text";.85 <= h && 1 > h ? l = "gold_text" : .85 > h && (l = "red_text");
            d += "<span class='blue_text'>Balance: </span><span class='" + l + "' style='float:right;margin-right:20%;'>" + parseInt(Math.floor(e)) + "</span><br>";
            d += "<span class='blue_text'>Efficiency: </span><span class='" + l + "' style='float:right;margin-right:20%;'>" + Math.floor(1E4 * h) / 100 + "%</span><br><br>";
            gameSettings.populationEnabled && (d += "<span class='blue_text'>Population Growth: </span><span id='popGrow' class='white_text' style='float:right;margin-right:20%;'>" + 100 * b.basePopulation + "%" + (0 < b.structure[buildingsName.clonation].number ? "<span class='green_text'>(+" + b.structure[buildingsName.clonation].number + "%)</span>" : "") + "/y</span><br>", d += "<span class='blue_text'>Population: </span><span class='white_text' style='float:right;margin-right:20%;' id='popul'>" + beauty(b.population) + " " + (0 < b.globalProd.population +
                b.populationRatio ? "<span class='green_text'>(+" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>" : "<span class='red_text'>(" + beauty(b.globalProd.population + b.populationRatio) + "/s)</span>") + "</span><br>", d += "<span class='blue_text'>Habitable Space: </span><span class='white_text' style='float:right;margin-right:20%;' id='habitable'>" + beauty(b.habitableSpace()) + "</span><br><br>");
            d = d + "</div>" + uiScheduler.planetResourcesUpdater([b]);
            d += "</ul>";
            document.getElementById("market_mini_list") &&
                (document.getElementById("market_mini_list").innerHTML = d);
            for (d = 0; d < resNum; d++)
                if (resources[d].show(game)) {
                    for (h = e = 0; h < civis.length; h++) e += civis[h].marketExport(d) - civis[h].marketImport(d);
                    h = "<span class='red_text'> (~ ";
                    0 < e ? h = "<span class='green_text'> (~ +" : 0 == e && (h = "<span class='gray_text'> (~ ");
                    g += "<span class='white_text' id='market" + d + "stock'>\t" + beauty(market.stock[d]) + "/" + beauty(market.maxStock[d]) + "" + h + "" + beauty(e - m) + "/s)</span></span>";
                    $("#market" + d + "stock").html(beauty(market.stock[d]) +
                        "/" + beauty(market.maxStock[d]) + "" + h + "" + beauty(e) + "/s)")
                }
        };
        currentUpdater();
        y();
        E();
        $("#market_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(I);
        $("#back_button").show();
        game.searchPlanet(currentPlanet.id) && ($("#bottom_build_menu").show(), 5 <= game.researches[3].level ? ($("#b_market_icon").show(), $("#b_market_icon").show()) : (1 <= game.researches[3].level && $("#b_market_icon").show(), $("#b_market_icon").hide()))
    }

    function fa(b) {
        currentInterface = "diplomacyInterface";
        var d = "";
        if ("news" !=
            b) {
            b = uiScheduler.civisInfo(b);
            d += b.html;
            $("#diplomacy_list").html(d);
            for (d = 0; d < b.toBind.length; d++) {
                var e = b.toBind[d];
                $("#civis_plt_" + e).click(function () {
                    var b = $(this).attr("name");
                    A(planets[b])
                });
                h("civis_plt_" + e, "<span class='blue_text'>" + planets[e].name + "</span>", 8 * planets[e].name.length)
            }
            for (d = 0; d < b.buttons.length; d++) b.buttons[d].enable()
        }
        b = "";
        d = [];
        new z("civis_news", "News", 280, 40, function () {
            fa("news")
        });
        for (e = 1; e < civis.length; e++)
            if (civis[e].contacted()) {
                var g = new z("civis_diplo_" + e, "<img src='ui/civis/" +
                    civis[e].playerName + ".png' class='icon' style='position:absolute;left:4px;margin-top:4px'/>" + civis[e].name, 280, 40,
                    function () {
                        var b = $(this).attr("id").split("_");
                        fa(b[2])
                    });
                d.push(g);
                b += g.getHtml()
            }
        $("#diplomacy_mini_list").html(b);
        for (e = 0; e < d.length; e++) d[e].enable();
        currentUpdater = function () {};
        y();
        $("#diplomacy_interface").show()
    }

    function ka() {
        currentInterface = "profileInterface";
        var b = "<li style='height:64px;><div style='position:absolute; top:8px; left:8px; width:98%'></div></li><li style='height:64px;'><div style='position:absolute;  left: 8px; width:98%;'><span id='span_wipe' class='red_text' style='font-size:100%; width: 98%; float:left; text-align:center;cursor:pointer;'>Wipe Data<br>(BE SURE BEFORE CLICKING!!)</span><br><br></div></li><li style='height:64px;'><div style='position:absolute;  left: 8px; width:98%;'><span id='queue_wipe' class='red_text' style='font-size:100%; width: 98%; float:left; text-align:center;cursor:pointer;'>Reset queues and shipping<br></span></div></li><li style='height:100px;'><div style='position:absolute;  left: 8px; width:98%;'><span id='span_logs' class='blue_text' style='font-size:100%; width: 98%; float:left; text-align:center;cursor:pointer;'>Change logs<br></span><br><br></div></li><li style='height:32px;'><span style='position:absolute;left:0%;' class='blue_text'><input type='checkbox' id='tech_check' value='false'>Tech Tree visualization</input></span><span style='position:absolute;left:25%;' class='blue_text'><input type='checkbox' id='notation_check' value='false'>Scientific Notation</input></span><span style='position:absolute;left:50%;' class='blue_text'><input type='checkbox' id='allshipres_check' value='false'>Show all resources in shipyard</input></span><span style='position:absolute;left:75%;' class='blue_text'><input type='checkbox' id='hpleft_check' value='false'>Show hp left in battle report</input></span></li><li style='height:32px;'><span style='position:absolute;left:0%;' class='blue_text'><input type='checkbox' id='usequeue_check' value='false'>Enable building queue</input></span><span style='position:absolute;left:25%;' class='blue_text'><input type='checkbox' id='autoqueue_check' value='false'>Automatic construction for building queue</input></span><span style='position:absolute;left:50%;' class='blue_text'><input type='checkbox' id='resreq_check' value='false'>Automatic shipping for queue (BETA)</input></span><span style='position:absolute;left:75%;' class='blue_text'><input type='checkbox' id='showqd_check' value='false'>Show automatic delivery fleets</input></span></li><li style='height:32px;'><span style='position:absolute;left:0%;' class='blue_text'><input type='checkbox' id='sortresname_check' value='false'>Sort resources by name</input></span><span style='position:absolute;left:25%;' class='blue_text'><input type='checkbox' id='hidetut_check' value='false'>Hide tutorial</input></span><span style='position:absolute;left:50%;' class='blue_text'><input type='checkbox' id='showBuildingAid_check' value='false'>Show graphical info on building hover</input></span><span style='position:absolute;left:75%;' class='blue_text'><input type='checkbox' id='showMultipliers_check' value='false'>Show multipliers</input></span></li>" +
            ("<span id='span_copyright' class='white_text' style='position:absolute;font-size:80%; width: 98%; text-align:left;cursor:pointer;top:8%;left:2%'>\u00a9 2017 - version " + GAME_VERSION + "" + GAME_SUB_VERSION + "</span><br><br>");
        document.getElementById("profile_info_list") && (document.getElementById("profile_info_list").innerHTML = b);
        gameSettings.techTree ? $("#tech_check").prop("checked", !0) : $("#tech_check").prop("checked", !1);
        $("#tech_check").change(function () {
            gameSettings.techTree = this.checked
        });
        gameSettings.scientificNotation ?
            $("#notation_check").prop("checked", !0) : $("#notation_check").prop("checked", !1);
        $("#notation_check").change(function () {
            gameSettings.scientificNotation = this.checked
        });
        gameSettings.hideTutorial ? $("#hidetut_check").prop("checked", !0) : $("#hidetut_check").prop("checked", !1);
        $("#hidetut_check").change(function () {
            gameSettings.hideTutorial = this.checked
        });
        gameSettings.allShipres ? $("#allshipres_check").prop("checked", !0) : $("#allshipres_check").prop("checked", !1);
        $("#allshipres_check").change(function () {
            gameSettings.allShipres =
                this.checked
        });
        gameSettings.hpreport ? $("#hpleft_check").prop("checked", !0) : $("#hpleft_check").prop("checked", !1);
        $("#hpleft_check").change(function () {
            gameSettings.hpreport = this.checked
        });
        gameSettings.resourceRequest ? $("#resreq_check").prop("checked", !0) : $("#resreq_check").prop("checked", !1);
        $("#resreq_check").change(function () {
            gameSettings.resourceRequest = this.checked
        });
        addSettingCheck("usequeue_check", "useQueue");
        addSettingCheck("autoqueue_check", "autoQueue");
        addSettingCheck("showqd_check", "showqd");
        addSettingCheck("sortresname_check", "sortResName");
        addSettingCheck("showBuildingAid_check", "showBuildingAid");
        addSettingCheck("showMultipliers_check", "showMultipliers");
        $("#span_wipe").click(function () {
            (new v(220, 110, "<br><span class='red_text red_text_shadow'>Are you sure you want to wipe your data? You will lose ALL your progress!</span>", "confirm", function () {
                wipeData();
                (new v(210, 0, "<span class='red_text red_text_shadow'>Your data has been deleted!</span>", "info")).drawToast();
                currentPopup.drop()
            })).draw()
        });
        $("#queue_wipe").click(function () {
            for (var b = 0; b < planets.length; b++) {
                for (var d = 0; d < resNum; d++) planets[b].resourcesRequest[d] = 0;
                planets[b].queue = {}
            }(new v(210, 0, "<span class='blue_text'>Queues and automatic shipping reset</span>", "info")).drawToast()
        });
        $("#span_logs").click(function () {
            la()
        });
        currentUpdater = function () {};
        y();
        $("#profile_interface").show()
    }

    function la() {
        currentInterface = "logsInterface";
        for (var b = "", d = change_logs.length - 1; 0 <= d; d--) b += "<li style='height:" + (64 + 18 * change_logs[d].lines) + "px;'><div style='position:absolute;  left: 8px; width:98%;'>",
            b += "<br><br><span id='logs_title_" + d + "' class='blue_text' style='font-size:110%;text-align:center;width: 98%; float:left;cursor:pointer;'>**" + change_logs[d].title + "**</span><br><br>", b += "<span id='logs_" + d + "' class='white_text' style='width: 98%; float:left;cursor:pointer;'>" + change_logs[d].desc + "</span>", b += "</div></li>";
        document.getElementById("profile_info_list") && (document.getElementById("profile_info_list").innerHTML = b);
        currentUpdater = function () {};
        y();
        $("#profile_interface").show()
    }

    function ha() {
        currentInterface =
            "tournamentInterface";
        var b = 0;
        null == qurisTournament.fleet && (b = generateQurisTournamentFleet());
        var d = qurisTournament.fleet,
            e = {
                cnt: 0,
                html: "<ul id='ship_info_list' style='position:absolute; text-align:right; top:48px; margin-top:16px; clear:both;'><div style='position:relative; left:8px;'><span class='red_text' style='float:left;margin-left:16px;font-size:120%;'>There is no enemy available</span></div></ul>"
            };
        0 <= b && (e = uiScheduler.fleetInfo(0, 0, d));
        b = "<li style='height:400px;'><div style='position:absolute;  left: 8px; width:98%;'><img src='ui/banners/quris.png' style='position:absolute;top:0%;left:0%;z-index:90;'/>" +
            ("<img src='ui/banners/quris.png' style='position:absolute;top:0%;right:0%'/><span style='position:absolute;top:0%;left:27%;font-size:300%;colohr:rgb(188,24,7);' class='red_text' id='tournament_title'>The Space Tournament</span><span style='position:absolute;top:64px;left:27%;font-size:100%;' class='blue_text'>Points: <span class='white_text'>" + (qurisTournament.points + 1) + "</span></span><div style='position:absolute;top:64px;left:44%;font-size:100%;width:100px;height:24px;text-align:center;cursor:pointer;' class='green_button green_text' id='fight_button'>FIGHT</div></span></div></li>");
        var g = [],
            l;
        for (l in planets[tournamentPlanet].fleets) {
            var m = planets[tournamentPlanet].fleets[l];
            m && 0 != l && "hub" != l && m.civis == game.id && g.push(l)
        }
        b += "<li style='height:" + 16 * e.cnt + "px;width:100%' id='ally_li'>";
        b += "<select id='orbit_fleet_list' style='position:absolute;top:108px;width:18%;left:30%;'>";
        if (0 == g.length) b += "<option value='n'>No friendly fleets on " + planets[tournamentPlanet].name + "!</option>";
        else
            for (b += "<option value='s'>Select a fleet</option>", l = 0; l < g.length; l++) m = planets[tournamentPlanet].fleets[g[l]],
                b += "<option value='" + g[l] + "'>" + m.name + " (" + beauty(m.value()) + ")</option>";
        b = b + "</select><div style='position:absolute;top:100px;left:25%;width:25%;' id='ally_fleet'></div></li>" + ("<li style='height:" + 16 * e.cnt + "px;width:100%;' id='enemy_li'>");
        b = b + "<span id='ship_info_name' class='red_text' style='position:absolute;top:100px;left:50%;width:25%;font-size:150%'>Opponent Fleet</span>" + ("<div style='position:absolute;top:100px;left:50%;width:25%;font-size:100%'>" + e.html + "</div></li>");
        b += "<li style='width:100%;height:auto;' id='report_li'><span id='ship_info_name' class='blue_text' style='position:absolute;top:100px;left:33%;width:25%;font-size:150%'>Battle Report</span><img id='close_report' src='ui/x.png' style='width:32px;height:32px;left:67%;position:absolute;top:96px;cursor:pointer;'/><div style='position:absolute;top:148px;left:25%;width:50%;font-size:100%' id='tournament_report'></div></li>";
        document.getElementById("profile_interface") && (document.getElementById("profile_info_list").innerHTML = b);
        $("#tournament_title").click(ha);
        $("#fight_button").hide();
        $("#report_li").hide();
        $("#close_report").click(function () {
            ha()
        });
        $("#orbit_fleet_list").change(function () {
            var b = $("#orbit_fleet_list").val();
            if (planets[tournamentPlanet].fleets[b]) {
                var d = uiScheduler.fleetInfo(0, 0, planets[tournamentPlanet].fleets[b]);
                $("#ally_fleet").html(d.html);
                $("#ally_li").css("height", 48 + 16 * d.cnt + "px");
                d = qurisTournament.fleet.battle(planets[tournamentPlanet].fleets[b], !0);
                b = "";
                "atk" == d.winner ? (b += "<span class='green_text text_shadow'>Your fleet will win the battle!</span>", $("#fight_button").removeClass("red_button red_text"), $("#fight_button").removeClass("orange_button orange_text"), $("#fight_button").addClass("green_button green_text")) : "def" == d.winner ? (b += "<span class='red_text red_text_shadow'>Your fleet will lose the battle!</span>", $("#fight_button").addClass("red_button red_text"), $("#fight_button").removeClass("green_button green_text"), $("#fight_button").removeClass("orange_button orange_text")) :
                    "draw" == d.winner && (b += "<span class='orange_text'>The battle will result in a draw!</span>", $("#fight_button").removeClass("red_button red_text"), $("#fight_button").removeClass("green_button green_text"), $("#fight_button").addClass("orange_button orange_text"));
                h("fight_button", b, 180);
                $("#fight_button").click(function () {
                    var b = $("#orbit_fleet_list").val(),
                        d = planets[tournamentPlanet].fleets[b],
                        e = tournamentPlanet;
                    if (d) {
                        d = qurisTournament.fleet.battle(d, !1);
                        var g = d.r.split("<br>").length;
                        "atk" == d.winner ?
                            (pop = new v(210, 96, "<br><span class='blue_text text_shadow'>Your fleet won the battle!</span>", "Ok"), pop.draw(), qurisTournament.points++) : "def" == d.winner ? (pop = new v(210, 96, "<br><span class='red_text red_text_shadow'>Your fleet lost the battle!</span>", "Ok"), pop.draw(), qurisTournament.lose++) : "draw" == d.winner && (pop = new v(210, 96, "<br><span class='orange_text'>The battle resulted in a draw!</span>", "Ok"), pop.draw());
                        qurisTournament.fleet && 0 == qurisTournament.fleet.shipNum() && (qurisTournament.fleet = null);
                        0 == planets[e].fleets[b].shipNum() && delete planets[e].fleets[b];
                        $("#tournament_report").html(d.r);
                        $("#ally_li").hide();
                        $("#enemy_li").hide();
                        $("#fight_button").hide();
                        $("#report_li").show();
                        $("#report_li").css("height", 23 * g + "px")
                    } else pop = new v(210, 96, "<br><span class='red_text red_text_shadow'>Select a fleet!</span>", "Info"), pop.draw()
                });
                $("#fight_button").show();
                for (d = 0; d < ships.length; d++) {
                    b = $("#orbit_fleet_list").val();
                    var e = planets[tournamentPlanet].fleets[b];
                    if (0 < e.ships[d]) {
                        var g = d;
                        b = "<span class='blue_text'>Power: </span><span class='white_text'>" +
                            beauty(ships[g].power) + "</span><br>";
                        b += "<span class='blue_text'>Weapon: </span><span class='white_text'>" + ships[g].weapon.capitalize() + "</span><br>";
                        b += "<span class='blue_text'>Armor: </span><span class='white_text'>" + beauty(ships[g].armor) + "</span><br>";
                        b += "<span class='blue_text'>HPs: </span><span class='white_text'>" + beauty(ships[g].hp) + "</span><br>";
                        0 < ships[g].piercing && (b += "<span class='blue_text' style='float:left;margin-left:16px;'>Piercing Power: </span><span class='white_text'>" + Math.min(100,
                            ships[g].piercing) + "%</span><br>");
                        0 < ships[g].shield && (b += "<span class='blue_text' style='float:left;margin-left:16px;'>Shields: </span><span class='white_text'>" + beauty(ships[g].shield) + "</span><br>");
                        b += "<span class='blue_text'>Dmg Reduction: </span><span class='white_text'>" + Math.floor(100 * (100 - 100 / (1 + Math.log(1 + ships[g].armor * (1 + e.storage[resourcesName.armor.id] / (2 * mi)) / 1E4) / Math.log(2)))) / 100 + "%</span><br>";
                        b += "<span class='blue_text'>Speed: </span><span class='white_text'>" + Math.floor(100 * ships[g].speed *
                            (1 + e.storage[resourcesName.engine.id] / 1E3 * 2E-4)) / 100 + "</span><br>";
                        b += "<span class='blue_text'>Weight: </span><span class='white_text'>" + beauty(ships[g].weight) + "</span><br>";
                        b += "<span class='blue_text'>Weight%: </span><span class='white_text'>" + Math.floor(ships[g].weight * e.ships[g] / e.weight() * 1E4) / 100 + "%</span><br>";
                        h("ship_name_infos_" + d, b, 140)
                    }
                }
                for (d = b = 0; d < ships.length; d++) b += ships[d].power * e.ships[d];
                d = 10 * b * Math.log(1 + e.storage[resourcesName.ammunition.id] / (10 * mi)) / Math.log(2);
                g = 20 * b * Math.log(1 +
                    e.storage[resourcesName["u-ammunition"].id] / (10 * mi)) / Math.log(2);
                var l = 60 * b * Math.log(1 + e.storage[resourcesName["t-ammunition"].id] / (20 * mi)) / Math.log(2);
                e = 1 + .1 * Math.log(1 + e.ships[14]) / Math.log(2);
                b = "<span class='blue_text'>Base Power: </span><span class='white_text'>" + beauty(b) + "</span><br>";
                b += "<span class='blue_text'>Ammo Bonus: </span><span class='white_text'>+" + beauty(d) + "</span><br>";
                b += "<span class='blue_text'>U-Ammo Bonus: </span><span class='white_text'>+" + beauty(g) + "</span><br>";
                b += "<span class='blue_text'>T-Ammo Bonus: </span><span class='white_text'>+" +
                    beauty(l) + "</span><br>";
                b += "<span class='blue_text'>Admiral Bonus: </span><span class='white_text'>x" + beauty(e) + "</span><br>";
                h("ammo_bonus", b, 200)
            } else $("#ally_fleet").html(""), $("#fight_button").hide()
        });
        for (e = 0; e < ships.length; e++) 0 < d.ships[e] && (g = e, b = "<span class='blue_text'>Power: </span><span class='white_text'>" + beauty(ships[g].power) + "</span><br>", b += "<span class='blue_text'>Weapon: </span><span class='white_text'>" + ships[g].weapon.capitalize() + "</span><br>", b += "<span class='blue_text'>Armor: </span><span class='white_text'>" +
            beauty(ships[g].armor) + "</span><br>", b += "<span class='blue_text'>HPs: </span><span class='white_text'>" + beauty(ships[g].hp) + "</span><br>", 0 < ships[g].piercing && (b += "<span class='blue_text' style='float:left;margin-left:16px;'>Piercing Power: </span><span class='white_text'>" + Math.min(100, ships[g].piercing) + "%</span><br>"), 0 < ships[g].shield && (b += "<span class='blue_text' style='float:left;margin-left:16px;'>Shields: </span><span class='white_text'>" + beauty(ships[g].shield) + "</span><br>"), b += "<span class='blue_text'>Dmg Reduction: </span><span class='white_text'>" +
            Math.floor(100 * (100 - 100 / (1 + Math.log(1 + ships[g].armor * (1 + d.storage[resourcesName.armor.id] / (2 * mi)) / 1E4) / Math.log(2)))) / 100 + "%</span><br>", b += "<span class='blue_text'>Speed: </span><span class='white_text'>" + Math.floor(100 * ships[g].speed * (1 + d.storage[resourcesName.engine.id] / 1E3 * 2E-4)) / 100 + "</span><br>", b += "<span class='blue_text'>Weight: </span><span class='white_text'>" + beauty(ships[g].weight) + "</span><br>", b += "<span class='blue_text'>Weight%: </span><span class='white_text'>" + Math.floor(ships[g].weight *
                d.ships[g] / d.weight() * 1E4) / 100 + "%</span><br>", h("ship_name_infos_" + e, b, 140));
        currentUpdater = function () {};
        y();
        $("#profile_interface").show()
    }

    function D(b) {
        return "</span><span class='blue_text'>" + b + "</span><span class='white_text'>"
    }

    function ia() {
        currentInterface = "resourcesOverview";
        currentUpdater = function () {};
        var b = "<li id='empire_li' style='height:64px;width:100%'><img src='ui/empire.png' class='planet_icon' style='align:center;cursor:pointer;'/><span class='blue_text' style='position:relative; top:-26px; left:8px; font-size: 100%;cursor:pointer;'>Empire</span><span class='blue_text' style='position:relative; top:-26px; left:32px; font-size: 80%;cursor:pointer;width:100%' id='empire_overview' name='exp'>Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span><div id='empire_overview_info' style='position:relative;left:10%;width:80%;'></div></li>";
        for (var d = 0; d < game.planets.length; d++) {
            var e = game.planets[d];
            b += "<li id='planet" + e + "' name='" + e + "' style='height:64px;width:100%'>";
            b += "<img id='planet_img_" + e + "' name='" + d + "' src='img/" + planets[game.planets[d]].icon + "/" + planets[game.planets[d]].icon + ".png' class='planet_icon' style='align:center;cursor:pointer;'/>";
            b = capital == d ? b + ("<span id='planet_int_" + e + "' name='" + d + "' class='blue_text' style='position:relative; top:-26px; left:8px; font-size: 100%; color:rgb(249,159,36);cursor:pointer;'>" + planets[e].name +
                "</span>") : b + ("<span id='planet_int_" + e + "' name='" + d + "' class='blue_text' style='position:relative; top:-26px; left:8px; font-size: 100%;cursor:pointer;'>" + planets[e].name + "</span>");
            b += "<span class='blue_text' style='position:relative; top:-26px; left:32px; font-size: 80%;cursor:pointer;width:100%' id='planet_overview_" + e + "' name='exp_" + e + "' >Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span>";
            b += "<div id='planet_overview_info_" +
                e + "' name='" + e + "' style='position:relative;left:10%;width:80%;'>";
            b += "</div></li>"
        }
        document.getElementById("planet_list") && (document.getElementById("planet_list").innerHTML = b);
        for (d = 0; d < game.planets.length; d++) planets[game.planets[d]].importExport(), e = game.planets[d], $("#planet_int_" + e).click(function () {
            A(planets[game.planets[parseInt($(this).attr("name"))]])
        }), $("#planet_img_" + e).click(function () {
            A(planets[game.planets[parseInt($(this).attr("name"))]])
        }), $("#planet_overview_" + e).click(function () {
            var b =
                $(this).attr("name").split("_"),
                d = b[0];
            b = parseInt(b[1]);
            if ("exp" == d) {
                var e = planets[b].rawProduction();
                this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                $(this).attr("name", "hide_" + b);
                d = 64;
                for (var g = "", h = 0; h < resNum; h++) resources[h].show(game) && (e[h] += planets[b].globalImport[h] - planets[b].globalExport[h], g += "<div style='width:100%;height:24px' id='planet_res_" + b + "_" + h + "' name='" + b + "_" + h + "'><div class='button' style='height:24px;'><span class='blue_text' style='width:240px'>" +
                    resources[h].name.capitalize() + ": </span><span class='white_text' style='float:right;margin-right:32px;'><span id='total_res_" + b + "_" + h + "'>" + beauty(planets[b].resources[h]) + " <span class='" + (0 <= e[h] ? 0 < e[h] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < e[h] ? "+" : "") + "" + beauty(e[h]) + "/s)</span></span><span class='blue_text' style='font-size:80%;cursor:pointer;padding-left:64px' id='res_overview_" + b + "_" + h + "' name='exp_" + b + "_" + h + "' >Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span></span>",
                    g += "</div><div id='planet_res_building_" + b + "_" + h + "' name='" + b + "_" + h + "' style='position:relative;left:10%;width:80%;'></div></div>", d += 24);
                h = planets[b].energyProduction() + planets[b].energyConsumption();
                var l = planets[b].energyMalus();
                1 < l ? l = 1 : 0 > l && (l = 0);
                var m = "green_text";.85 <= l && 1 > l ? m = "gold_text" : .85 > l && (m = "red_text");
                g += "<div style='width:100%;height:24px' id='planet_res_" + b + "_energy' name='" + b + "_energy'><div class='button' style='height:24px;'><span class='blue_text' style='width:240px'>Energy: </span><span class='white_text' style='float:right;margin-right:32px;'><span id='total_res_" +
                    b + "_energy'> <span class='" + m + "'>" + beauty(h) + " (" + Math.floor(1E4 * l) / 100 + "% efficiency)</span></span><span class='blue_text' style='font-size:80%;cursor:pointer;padding-left:64px' id='res_overview_" + b + "_energy' name='exp_" + b + "_energy' >Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span></span>";
                e = e.researchPoint;
                g = g + ("</div><div id='planet_res_building_" + b + "_energy' name='" + b + "_energy' style='position:relative;left:10%;width:80%;'></div></div>") +
                    ("<div style='width:100%;height:24px' id='planet_res_" + b + "_research' name='" + b + "_research'><div class='button' style='height:24px;'><span class='blue_text' style='width:240px'>Research Points: </span><span class='white_text' style='float:right;margin-right:32px;'><span id='total_res_" + b + "_research'>" + beauty(game.researchPoint) + " <span class='" + (0 < e ? "green_text" : "gray_text") + "'>(" + beauty(e) + "/s)</span></span><span class='blue_text' style='font-size:80%;cursor:pointer;padding-left:64px' id='res_overview_" +
                        b + "_research' name='exp_" + b + "_research' >Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span></span>");
                g = g + ("</div><div id='planet_res_building_" + b + "_research' name='" + b + "_research' style='position:relative;left:10%;width:80%;'></div></div>") + "<br>";
                d += 96;
                document.getElementById("planet_overview_info_" + b) && (document.getElementById("planet_overview_info_" + b).innerHTML = g);
                $("#planet" + b).css("height", d + "px");
                overviewPlanetExpand[b] = !0;
                for (h = 0; h < resNum; h++) resources[h].show(game) && ($("#res_overview_" + b + "_" + h).unbind(), $("#res_overview_" + b + "_" + h).click(function () {
                    var b = $(this).attr("name").split("_"),
                        d = b[0],
                        e = parseInt(b[1]);
                    b = parseInt(b[2]);
                    if ("exp" == d) {
                        overviewResourceExpand[e][b] = !0;
                        d = "<div style='width:100%;height:8px'></div>";
                        for (var g = 52, h = 0; h < game.buildings.length; h++)
                            if (0 != game.buildings[h].resourcesProd[b] && 0 < planets[e].structure[h].number) {
                                g += 20;
                                var l = game.buildings[h].production(planets[e])[b];
                                d += "<div style='width:100%;height:20px' class='button' id='planet_res_" +
                                    e + "_" + b + "_" + h + "' name='" + e + "_" + b + "'>";
                                d = planets[e].structure[h].active ? d + ("<img id='planet_shut_" + e + "_" + h + "' name='" + e + "_" + h + "' src='ui/act.png' style='z-index:10;width:16px;height:16px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>") : d + ("<img id='planet_shut_" + e + "_" + h + "' name='" + e + "_" + h + "' src='ui/shut.png' style='z-index:10;width:16px;height:16px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>");
                                d += "<span class='blue_text' style='width:240px'>" + game.buildings[h].displayName +
                                    " <span class='white_text'>" + planets[e].structure[h].number + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= l ? 0 < l ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < l ? "+" : "") + "" + beauty(l) + "/s)</span></span></div>"
                            }
                        l = planets[e].globalImport[b] - planets[e].globalExport[b];
                        d = d + "<div style='width:100%;height:20px'></div>" + ("<div style='width:100%;height:20px' class='button' id='planet_res_" + e + "_" + b + "_import' name='" + e + "_" + b + "'><span class='blue_text' style='width:240px'>Import/Export </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" +
                            (0 <= l ? 0 < l ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < l ? "+" : "") + "" + beauty(l) + "/s)</span></span></div>");
                        g += 20;
                        $("#planet_res_" + e + "_" + b).css("height", g + "px");
                        h = parseInt($("#planet" + e).css("height").split("px")[0]);
                        $("#planet" + e).css("height", h + g + "px");
                        document.getElementById("planet_res_building_" + e + "_" + b) && (document.getElementById("planet_res_building_" + e + "_" + b).innerHTML = d);
                        this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                        $(this).attr("name", "hide_" + e + "_" + b)
                    } else overviewResourceExpand[e][b] = !1, this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp_" + e + "_" + b), g = parseInt($("#planet_res_" + e + "_" + b).css("height").split("px")[0]), h = parseInt($("#planet" + e).css("height").split("px")[0]), d = 0 < h - g ? h - g : 0, $("#planet" + e).css("height", d + "px"), $("#planet_res_" + e + "_" + b).css("height", "24px"), document.getElementById("planet_res_building_" +
                        e + "_" + b) && (document.getElementById("planet_res_building_" + e + "_" + b).innerHTML = "")
                }), $("#res_overview_" + b + "_energy").unbind(), $("#res_overview_" + b + "_energy").click(function () {
                    var b = $(this).attr("name").split("_"),
                        d = b[0];
                    b = parseInt(b[1]);
                    if ("exp" == d) {
                        overviewResourceExpand[b].energy = !0;
                        d = "<div style='width:100%;height:8px'></div>";
                        for (var e = 32, g = 0; g < game.buildings.length; g++)
                            if (0 != game.buildings[g].energy && 0 < planets[b].structure[g].number) {
                                e += 20;
                                var h = game.buildings[g].production(planets[b]).energy;
                                d += "<div style='width:100%;height:20px' class='button' id='planet_res_" + b + "_energy_" + g + "' name='" + b + "_energy'><span class='blue_text' style='width:240px'>" + game.buildings[g].displayName + " <span class='white_text'>" + planets[b].structure[g].number + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span></div>"
                            }
                        d += "</div>";
                        $("#planet_res_" + b + "_energy").css("height",
                            e + "px");
                        g = parseInt($("#planet" + b).css("height").split("px")[0]);
                        $("#planet" + b).css("height", g + e + "px");
                        document.getElementById("planet_res_building_" + b + "_energy") && (document.getElementById("planet_res_building_" + b + "_energy").innerHTML = d);
                        this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                        $(this).attr("name", "hide_" + b + "_energy")
                    } else overviewResourceExpand[b].energy = !1, this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />",
                        $(this).attr("name", "exp_" + b + "_energy"), e = parseInt($("#planet_res_" + b + "_energy").css("height").split("px")[0]), g = parseInt($("#planet" + b).css("height").split("px")[0]), d = 0 < g - e ? g - e : 0, $("#planet" + b).css("height", d + "px"), $("#planet_res_" + b + "_energy").css("height", "24px"), document.getElementById("planet_res_building_" + b + "_energy") && (document.getElementById("planet_res_building_" + b + "_energy").innerHTML = "")
                }), $("#res_overview_" + b + "_research").unbind(), $("#res_overview_" + b + "_research").click(function () {
                    var b =
                        $(this).attr("name").split("_"),
                        d = b[0];
                    b = parseInt(b[1]);
                    if ("exp" == d) {
                        overviewResourceExpand[b].research = !0;
                        d = "<div style='width:100%;height:8px'></div>";
                        for (var e = 32, g = 0; g < game.buildings.length; g++)
                            if (0 != game.buildings[g].researchPoint && 0 < planets[b].structure[g].number) {
                                e += 20;
                                var h = game.buildings[g].production(planets[b]).researchPoint;
                                d += "<div style='width:100%;height:20px' class='button' id='planet_res_" + b + "_research_" + g + "' name='" + b + "_research'><span class='blue_text' style='width:240px'>" + game.buildings[g].displayName +
                                    " <span class='white_text'>" + planets[b].structure[g].number + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span></div>"
                            }
                        d += "</div>";
                        $("#planet_res_" + b + "_research").css("height", e + "px");
                        g = parseInt($("#planet" + b).css("height").split("px")[0]);
                        $("#planet" + b).css("height", g + e + "px");
                        $("#planet_res_building_" + b + "_research").html(d);
                        this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                        $(this).attr("name", "hide_" + b + "_research")
                    } else overviewResourceExpand[b].research = !1, this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp_" + b + "_research"), e = parseInt($("#planet_res_" + b + "_research").css("height").split("px")[0]), g = parseInt($("#planet" + b).css("height").split("px")[0]), d = 0 < g - e ? g - e : 0, $("#planet" + b).css("height", d + "px"), $("#planet_res_" + b + "_research").css("height", "24px"), $("#planet_res_building_" +
                        b + "_research").html("")
                }))
            } else overviewPlanetExpand[b] = !1, this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp_" + b), $("#planet" + b).css("height", "64px"), document.getElementById("planet_overview_info_" + b) && (document.getElementById("planet_overview_info_" + b).innerHTML = "")
        });
        $("#empire_overview").click(function () {
            if ("exp" == $(this).attr("name")) {
                for (var b = Array(resNum + 1), d = Array(resNum), e = 0; e < resNum; e++) b[e] =
                    0, d[e] = 0;
                for (var g = b.researchPoint = 0; g < game.planets.length; g++) {
                    var h = planets[game.planets[g]].rawProduction();
                    for (e = 0; e < resNum; e++) b[e] += h[e], d[e] += planets[game.planets[g]].resources[e];
                    b.researchPoint += h.researchPoint
                }
                this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                $(this).attr("name", "hide");
                g = 64;
                h = "";
                for (e = 0; e < resNum; e++) resources[e].show(game) && (h += "<div style='width:100%;height:24px' id='empire_res_" + e + "' name='" +
                    e + "'><div class='button' style='height:24px;'><span class='blue_text' style='width:240px'>" + resources[e].name.capitalize() + ": </span><span class='white_text' style='float:right;margin-right:32px;'><span id='total_res_empire_" + e + "'>" + beauty(d[e]) + " <span class='" + (0 <= b[e] ? 0 < b[e] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < b[e] ? "+" : "") + "" + beauty(b[e]) + "/s)</span></span><span class='blue_text' style='font-size:80%;cursor:pointer;padding-left:64px' id='res_overview_empire_" + e + "' name='exp_" + e + "' >Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span></span>",
                    h += "</div><div id='empire_res_building_" + e + "' name='" + e + "' style='position:relative;left:10%;width:80%;'></div></div>", g += 24);
                b = b.researchPoint;
                h += "<div style='width:100%;height:24px' id='empire_res_research' name='empire_research'><div class='button' style='height:24px;'><span class='blue_text' style='width:240px'>Research Points: </span><span class='white_text' style='float:right;margin-right:32px;'><span id='total_res_empire_research'>" + beauty(game.researchPoint) + " <span class='" + (0 < b ? "green_text" :
                    "gray_text") + "'>(" + beauty(b) + "/s)</span></span><span class='blue_text' style='font-size:80%;cursor:pointer;padding-left:64px' id='res_overview_empire_research' name='exp_empire_research' >Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' /></span></span>";
                h += "</div><div id='empire_res_building_research' name='empire_research' style='position:relative;left:10%;width:80%;'></div></div><br>";
                g += 96;
                document.getElementById("empire_overview_info") &&
                    (document.getElementById("empire_overview_info").innerHTML = h);
                $("#empire_li").css("height", g + "px");
                overviewPlanetExpand.empire = !0;
                for (e = 0; e < resNum; e++) resources[e].show(game) && ($("#res_overview_empire_" + e).unbind(), $("#res_overview_empire_" + e).click(function () {
                    var b = $(this).attr("name").split("_"),
                        d = b[0];
                    b = parseInt(b[1]);
                    if ("exp" == d) {
                        overviewResourceExpand.empire[b] = !0;
                        d = "<div style='width:100%;height:8px'></div>";
                        for (var e = 52, g = Array(game.buildings.length), h = 0; h < game.buildings.length; h++) g[h] = 0;
                        for (var l = 0; l < game.planets.length; l++)
                            for (h = 0; h < game.buildings.length; h++) 0 != game.buildings[h].resourcesProd[b] && (g[h] += planets[game.planets[l]].structure[h].number);
                        for (h = 0; h < game.buildings.length; h++)
                            if (0 < g[h]) {
                                e += 20;
                                var m = 0;
                                for (l = 0; l < game.planets.length; l++) m += game.buildings[h].production(planets[game.planets[l]])[b];
                                d += "<div style='width:100%;height:20px' class='button' id='empire_res_" + b + "_" + h + "' name='" + b + "'><span class='blue_text' style='width:240px'>" + game.buildings[h].displayName + " <span class='white_text'>" +
                                    g[h] + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= m ? 0 < m ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < m ? "+" : "") + "" + beauty(m) + "/s)</span></span></div>"
                            }
                        $("#empire_res_" + b).css("height", e + "px");
                        g = parseInt($("#empire_li").css("height").split("px")[0]);
                        $("#empire_li").css("height", g + e + "px");
                        document.getElementById("empire_res_building_" + b) && (document.getElementById("empire_res_building_" + b).innerHTML = d);
                        this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                        $(this).attr("name", "hide_" + b)
                    } else overviewResourceExpand.empire[b] = !1, this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp_" + b), e = parseInt($("#empire_res_" + b).css("height").split("px")[0]), g = parseInt($("#empire_li").css("height").split("px")[0]), d = 0 < g - e ? g - e : 0, $("#empire_li").css("height", d + "px"), $("#empire_res_" + b).css("height", "24px"), document.getElementById("empire_res_building_" + b) && (document.getElementById("empire_res_building_" +
                        b).innerHTML = "")
                }), $("#res_overview_empire_research").unbind(), $("#res_overview_empire_research").click(function () {
                    if ("exp" == $(this).attr("name").split("_")[0]) {
                        overviewResourceExpand.empire.research = !0;
                        for (var b = "<div style='width:100%;height:8px'></div>", d = 32, e = Array(game.buildings.length), g = 0; g < game.buildings.length; g++) e[g] = 0;
                        for (var h = 0; h < game.planets.length; h++)
                            for (g = 0; g < game.buildings.length; g++) 0 != game.buildings[g].researchPoint && (e[g] += planets[game.planets[h]].structure[g].number);
                        for (g =
                            0; g < game.buildings.length; g++)
                            if (0 < e[g]) {
                                d += 20;
                                var l = 0;
                                for (h = 0; h < game.planets.length; h++) l += game.buildings[g].production(planets[game.planets[h]]).researchPoint;
                                b += "<div style='width:100%;height:20px' class='button' id='empire_res_research_" + g + "' name='empire_research'><span class='blue_text' style='width:240px'>" + game.buildings[g].displayName + " <span class='white_text'>" + e[g] + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= l ? 0 < l ? "green_text" : "gray_text" :
                                    "red_text") + "'>(" + (0 < l ? "+" : "") + "" + beauty(l) + "/s)</span></span></div>"
                            }
                        b += "</div>";
                        $("#empire_res_research").css("height", d + "px");
                        e = parseInt($("#empire_li").css("height").split("px")[0]);
                        $("#empire_li").css("height", e + d + "px");
                        document.getElementById("empire_res_building_research") && (document.getElementById("empire_res_building_research").innerHTML = b);
                        this.innerHTML = "Hide overview<img src='ui/arrow_up.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />";
                        $(this).attr("name", "hide_research")
                    } else overviewResourceExpand.empire.research = !1, this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp_research"), d = parseInt($("#empire_res_research").css("height").split("px")[0]), e = parseInt($("#empire_li").css("height").split("px")[0]), b = 0 < e - d ? e - d : 0, $("#empire_li").css("height", b + "px"), $("#empire_res_research").css("height", "24px"), document.getElementById("empire_res_building_research") && (document.getElementById("empire_res_building_research").innerHTML =
                        "")
                }))
            } else this.innerHTML = "Show overview<img src='ui/arrow_down.png' style='position:relative; width:20px;height:20px;top:5px;left:4px' />", $(this).attr("name", "exp"), $("#empire_li").css("height", "64px"), document.getElementById("empire_overview_info") && (document.getElementById("empire_overview_info").innerHTML = ""), overviewPlanetExpand.empire = !1
        });
        for (d = 0; d < game.planets.length; d++)
            if (e = game.planets[d], overviewPlanetExpand[e]) {
                $("#planet_overview_" + d).click();
                for (b = 0; b < resNum; b++) overviewResourceExpand[e][b] &&
                    $("#res_overview_" + e + "_" + b).click();
                overviewResourceExpand[e].energy && $("#res_overview_" + e + "_energy").click();
                overviewResourceExpand[e].research && $("#res_overview_" + e + "_research").click()
            }
        if (overviewPlanetExpand.empire) {
            $("#empire_overview").click();
            for (b = 0; b < resNum; b++) overviewResourceExpand.empire[b] && $("#res_overview_empire_" + b).click();
            overviewResourceExpand.empire.research && $("#res_overview_empire_research").click()
        }
        currentUpdater = function () {
            for (var b = 0; b < game.planets.length; b++) {
                var d = game.planets[b];
                if (overviewPlanetExpand[d]) {
                    planets[d].importExport();
                    for (var e = planets[d].rawProduction(), g = 0; g < resNum; g++) resources[g].show(game) && (e[g] += planets[d].globalImport[g] - planets[d].globalExport[g], $("#total_res_" + d + "_" + g).html(beauty(planets[d].resources[g]) + " <span class='" + (0 <= e[g] ? 0 < e[g] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < e[g] ? "+" : "") + "" + beauty(e[g]) + "/s)</span>"));
                    g = planets[d].energyProduction() + planets[d].energyConsumption();
                    var h = planets[d].energyMalus();
                    1 < h ? h = 1 : 0 > h && (h = 0);
                    var l = "green_text";
                    .85 <= h && 1 > h ? l = "gold_text" : .85 > h && (l = "red_text");
                    $("#total_res_" + d + "_energy").html("<span class='" + l + "'>" + beauty(g) + " (" + Math.floor(1E4 * h) / 100 + "% efficiency)</span>");
                    e = e.researchPoint;
                    $("#total_res_" + d + "_research").html("" + beauty(game.researchPoint) + " <span class='" + (0 < e ? "green_text" : "gray_text") + "'>(" + beauty(e) + "/s)</span>");
                    for (g = 0; g < resNum; g++)
                        if (overviewResourceExpand[d][g]) {
                            for (e = 0; e < game.buildings.length; e++) 0 != game.buildings[e].resourcesProd[g] && 0 < planets[d].structure[e].number && (h = game.buildings[e].production(planets[d])[g],
                                l = "", l = planets[d].structure[e].active ? l + ("<img id='planet_shut_" + d + "_" + g + "_" + e + "' name='" + d + "_" + e + "' src='ui/act.png' style='z-index:10;width:16px;height:16px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>") : l + ("<img id='planet_shut_" + d + "_" + g + "_" + e + "' name='" + d + "_" + e + "' src='ui/shut.png' style='z-index:10;width:16px;height:16px;position:relative;top:3px;left:-2px;' style='cursor:pointer;'/>"), l += "<span class='blue_text' style='width:240px'>" + game.buildings[e].displayName + " <span class='white_text'>" +
                                planets[d].structure[e].number + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span>", $("#planet_res_" + d + "_" + g + "_" + e).html(l), $("#planet_shut_" + d + "_" + g + "_" + e).unbind(), $("#planet_shut_" + d + "_" + g + "_" + e).click(function () {
                                    var b = $(this).attr("name").split("_"),
                                        d = parseInt(b[0]);
                                    b = parseInt(b[1]);
                                    planets[d].structure[b].active = !planets[d].structure[b].active
                                }));
                            h = planets[d].globalImport[g] -
                                planets[d].globalExport[g];
                            $("#planet_res_" + d + "_" + g + "_import").html("<span class='blue_text' style='width:240px'>Import/Export </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span>")
                        }
                    if (overviewResourceExpand[d].energy)
                        for (e = 0; e < game.buildings.length; e++) 0 != game.buildings[e].energy && 0 < planets[d].structure[e].number && (h = game.buildings[e].production(planets[d]).energy, $("#planet_res_" +
                            d + "_energy_" + e).html("<span class='blue_text' style='width:240px'>" + game.buildings[e].displayName + " <span class='white_text'>" + planets[d].structure[e].number + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span>"));
                    if (overviewResourceExpand[d].research)
                        for (e = 0; e < game.buildings.length; e++) 0 != game.buildings[e].researchPoint && 0 < planets[d].structure[e].number && (h =
                            game.buildings[e].production(planets[d]).researchPoint, $("#planet_res_" + d + "_research_" + e).html("<span class='blue_text' style='width:240px'>" + game.buildings[e].displayName + " <span class='white_text'>" + planets[d].structure[e].number + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span>"))
                }
            }
            if (overviewPlanetExpand.empire) {
                e = Array(resNum);
                d = Array(resNum);
                for (g = 0; g <
                    resNum; g++) e[g] = 0, d[g] = 0;
                for (b = e.researchPoint = 0; b < game.planets.length; b++) {
                    h = planets[game.planets[b]].rawProduction();
                    for (g = 0; g < resNum; g++) resources[g].show(game) && (e[g] += h[g], d[g] += planets[game.planets[b]].resources[g], document.getElementById("total_res_empire_" + g) && (document.getElementById("total_res_empire_" + g).innerHTML = beauty(d[g]) + " <span class='" + (0 <= e[g] ? 0 < e[g] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < e[g] ? "+" : "") + "" + beauty(e[g]) + "/s)</span>"));
                    e.researchPoint += h.researchPoint
                }
                e = e.researchPoint;
                document.getElementById("total_res_empire_research") && (document.getElementById("total_res_empire_research").innerHTML = "" + beauty(game.researchPoint) + " <span class='" + (0 < e ? "green_text" : "gray_text") + "'>(" + beauty(e) + "/s)</span>");
                d = Array(game.buildings.length);
                for (e = 0; e < game.buildings.length; e++) d[e] = 0;
                for (b = 0; b < game.planets.length; b++)
                    for (e = 0; e < game.buildings.length; e++) 0 != game.buildings[e].resourcesProd[g] && (d[e] += planets[game.planets[b]].structure[e].number);
                for (g = 0; g < resNum; g++)
                    if (overviewResourceExpand.empire[g])
                        for (e =
                            0; e < game.buildings.length; e++)
                            if (0 < d[e]) {
                                for (b = h = 0; b < game.planets.length; b++) h += game.buildings[e].production(planets[game.planets[b]])[g];
                                $("#empire_res_" + g + "_" + e).html("<span class='blue_text' style='width:240px'>" + game.buildings[e].displayName + " <span class='white_text'>" + d[e] + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span>")
                            }
                d = Array(game.buildings.length);
                for (e = 0; e < game.buildings.length; e++) d[e] = 0;
                for (b = 0; b < game.planets.length; b++)
                    for (e = 0; e < game.buildings.length; e++) 0 != game.buildings[e].researchPoint && (d[e] += planets[game.planets[b]].structure[e].number);
                if (overviewResourceExpand.empire.research)
                    for (e = 0; e < game.buildings.length; e++)
                        if (0 < d[e]) {
                            for (b = h = 0; b < game.planets.length; b++) h += game.buildings[e].production(planets[game.planets[b]]).researchPoint;
                            document.getElementById("empire_res_research_" + e) && (document.getElementById("empire_res_research_" + e).innerHTML =
                                "<span class='blue_text' style='width:240px'>" + game.buildings[e].displayName + " <span class='white_text'>" + d[e] + "</span> </span><span class='white_text' style='float:right;margin-right:320px;'><span class='" + (0 <= h ? 0 < h ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h ? "+" : "") + "" + beauty(h) + "/s)</span></span>")
                        }
            }
        };
        y();
        $("#planet_selection_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(H);
        $("#back_button").show()
    }

    function da() {
        currentInterface = "exportInterface";
        currentUpdater = function () {};
        var g = "<div style='position:relative;left:16px;width:1168px'><br><span class='blue_text' id='expsave' style='font-size:100%;cursor:pointer;'>Exported Save - Copy and save</span>";
        btoa(capital);
        for (var h = [], l = 0; l < fleetSchedule.fleets.length; l++) fleetSchedule.fleets[l] && (h[l] = fleetSaver(fleetSchedule.fleets[l]));
        l = {};
        for (var m = 0; m < artifacts.length; m++) artifacts[m].possessed && (l[artifacts[m].id] = !0);
        var n = {};
        for (m = 0; m < quests.length; m++) quests[m].done && (n[quests[m].id] = !0);
        var v = {};
        for (m = 0; m < places.length; m++) places[m].done &&
            (v[places[m].id] = !0);
        var t = {};
        for (m = 0; m < tutorials.length; m++) tutorials[m].done && (t[tutorials[m].id] = !0);
        l = {
            fleets: fleetSchedule.fleets,
            count: fleetSchedule.count,
            m: market.toobj(),
            qur: {
                points: qurisTournament.points,
                lose: qurisTournament.lose
            },
            art: l,
            qst: n,
            plc: v,
            tuts: t
        };
        m = JSON.stringify(planetArraySaver(planets));
        n = JSON.stringify(civisArraySaver(civis));
        v = JSON.stringify(l);
        l = encodeURIComponent(m + "@DIVIDER@" + n + "@DIVIDER@" + v);
        console.log(LZString.compressToBase64(LZString.compressToUTF16(m)).length + " " +
            LZString.compressToBase64(LZString.compressToUTF16(n)).length + " " + LZString.compressToBase64(LZString.compressToUTF16(v)).length + " " + LZString.compressToBase64(LZString.compressToUTF16(JSON.stringify(h))).length);
        h = LZString.compressToUTF16(l);
        h = LZString.compressToBase64(h);
        m = LZString.decompressFromUTF16(LZString.decompressFromBase64(h));
        m == l && (g = g + "<textarea id='saveexport' spellcheck='false' rows='5' style='width:95%'>" + ("hg" + h + "@@") + "</textarea>");
        g += "<br><br><br><br><span class='button blue_text' id='impsave' style='position:absolute;left:150px;font-size:100%;cursor:pointer;'>Import Save</span><span class='button blue_text' id='impsave2' style='position:absolute;left:800px;font-size:100%;cursor:pointer;'>Alternative Import</span><br><br><textarea id='saveimport' spellcheck='false' rows='4' style='width:95%'></textarea></div>";
        document.getElementById("profile_info_list") && (document.getElementById("profile_info_list").innerHTML = g);
        document.getElementById("expsave") && (document.getElementById("expsave").innerHTML = "Export Save: (Data could be huge, so it could be slow!)<span class='white_text'>(Loading...)</span>");
        m == l ? (document.queryCommandSupported("copy") && document.getElementById("exportCopy") && document.getElementById("exportCopy").addEventListener("click", function (b) {
            document.getElementById("saveexport").select();
            try {
                document.execCommand("copy")
            } catch (T) {
                document.getElementById("exportCopy").innerHTML =
                    "<span class='red_text'>Error during copy, please retry again</span>"
            }
        }), document.getElementById("expsave") && (document.getElementById("expsave").innerHTML = "Export Save: (Data could be huge, so it could be slow!) <span class='green_text'>Done</span>")) : document.getElementById("expsave") && (document.getElementById("expsave").innerHTML = "Export Save: <span class='red_text'> ERROR EXPORTING</span>");
        $("#impsave").unbind();
        $("#impsave").click(function () {
            var d = document.getElementById("saveimport").value;
            d = d.split("@")[0];
            var g;
            (g = "hg" == d.substring(0, 2) ? decodeURIComponent(LZString.decompressFromUTF16(LZString.decompressFromBase64(d.substring(2)))) : LZString.decompressFromUTF16(LZString.decompressFromBase64(d))) || (g = "hg" == d.substring(0, 2) ? decodeURIComponent(LZString.decompressFromUTF16(atob(d.substring(2)))) : LZString.decompressFromUTF16(atob(d)));
            if (g) try {
                var h = g.split("@DIVIDER@");
                console.log(h[2]);
                if (3 <= h.length) {
                    for (d = 0; d < game.researches.length; d++)
                        for (var l = game.researches[d].level, m = 0; m < l; m++) game.researches[d].unbonus(),
                            game.researches[d].level--;
                    e();
                    firstTime = !1;
                    var u = JSON.parse(h[1]),
                        n = JSON.parse(h[0]),
                        v = JSON.parse(h[2]);
                    console.log("iMPORT");
                    clearTimeout(idleTimeout);
                    idleBon = 1;
                    for (d = 0; d < u.length; d++) civisLoader(civis[d], u[d], civis[d].name);
                    fleetSchedule.count = v.count;
                    m = 0;
                    for (var t in v.fleets) m++;
                    console.log(m);
                    console.log(v.fleets);
                    fleetSchedule.load(v.schedule, v.fleets, m);
                    v.m && market.load(v.m);
                    v.st && settingsLoader(v.st);
                    v.qur && (v.qur.points && (qurisTournament.points = v.qur.points || 0), v.qur.lose && (qurisTournament.lose =
                        v.qur.lose || 0));
                    if (v.art)
                        for (var x in v.art) artifacts[artifactsName[x]].collect();
                    if (v.qst)
                        for (var J in v.qst) quests[questNames[J]].done = !0;
                    if (v.plc)
                        for (J in v.plc) places[placesNames[J]].done = !0;
                    if (v.tuts)
                        for (J in v.tuts) tutorials[tutorialsNames[J]].done = !0;
                    game = civis[gameSettings.civis];
                    for (d = 0; d < n.length; d++) n[d] && planetLoader(planets[d], n[d]);
                    game.searchPlanet(planetsName.virgo) || (planets[planetsName.virgo].setCivis(8), civis[8].capital = planetsName.virgo);
                    game.searchPlanet(planetsName.nassaus) ||
                        (planets[planetsName.nassaus].setCivis(7), civis[7].capital = planetsName.nassaus);
                    setIdleBonus();
                    submitNumber("Number of planets", game.planets.length);
                    submitNumber("Infuence", game.influence());
                    var y = b();
                    submitNumber("Military Value", y);
                    submitNumber("Number of time travels", game.timeTravelNum);
                    var N = parseInt(Math.floor(game.days / 365));
                    submitNumber("Total years", N);
                    submitNumber("totaltp", parseInt(game.totalTPspent()));
                    submitNumber("Total Population", parseInt(game.totalPopulation()));
                    H()
                } else document.getElementById("impsave") &&
                    (document.getElementById("impsave").innerHTML = "Import Save: <span class='red_text'>Corrupted data</span>")
            } catch (oa) {
                console.log(oa.message), document.getElementById("impsave") && (document.getElementById("impsave").innerHTML = "Import Save: <span class='red_text'>Error</span>")
            } else document.getElementById("impsave") && (document.getElementById("impsave").innerHTML = "Import Save: <span class='red_text'>Invalid data</span>")
        });
        $("#impsave2").unbind();
        $("#impsave2").click(function () {
            var e = document.getElementById("saveimport").value;
            e = e.split("@")[0];
            if (e = "hg" == e.substring(0, 2) ? decodeURIComponent(LZString.decompressFromUTF16(LZString.decompressFromBase64(e.substring(2)))) : LZString.decompressFromUTF16(LZString.decompressFromBase64(e))) {
                var g = e.split("@DIVIDER@");
                if (3 <= g.length) {
                    for (e = 0; e < game.researches.length; e++)
                        for (var h = game.researches[e].level, l = 0; l < h; l++) game.researches[e].unbonus(), game.researches[e].level--;
                    d();
                    firstTime = !1;
                    l = JSON.parse(g[1]);
                    h = JSON.parse(g[0]);
                    g = JSON.parse(g[2]);
                    console.log("iMPORT");
                    console.log(g);
                    clearTimeout(idleTimeout);
                    idleBon = 1;
                    for (e = 0; e < l.length; e++) civisLoader(civis[e], l[e], civis[e].name);
                    fleetSchedule.count = g.count;
                    l = 0;
                    for (var m in g.fleets) l++;
                    console.log(l);
                    console.log(g.fleets);
                    fleetSchedule.load(g.schedule, g.fleets, l);
                    g.m && market.load(g.m);
                    g.st && settingsLoader(g.st);
                    g.qur && (g.qur.points && (qurisTournament.points = g.qur.points || 0), g.qur.lose && (qurisTournament.lose = g.qur.lose || 0));
                    if (g.art)
                        for (var u in g.art) artifacts[artifactsName[u]].collect();
                    if (g.qst)
                        for (var n in g.qst) quests[questNames[n]].done = !0;
                    if (g.plc)
                        for (n in g.plc) places[placesNames[n]].done = !0;
                    if (g.tuts)
                        for (n in g.tuts) tutorials[tutorialsNames[n]].done = !0;
                    game = civis[gameSettings.civis];
                    for (e = 0; e < h.length; e++) h[e] && planetLoader(planets[e], h[e]);
                    game.searchPlanet(planetsName.virgo) || (planets[planetsName.virgo].setCivis(8), civis[8].capital = planetsName.virgo);
                    game.searchPlanet(planetsName.nassaus) || (planets[planetsName.nassaus].setCivis(7), civis[7].capital = planetsName.nassaus);
                    setIdleBonus();
                    submitNumber("Number of planets", game.planets.length);
                    submitNumber("Infuence", game.influence());
                    m = b();
                    submitNumber("Military Value", m);
                    submitNumber("Number of time travels", game.timeTravelNum);
                    m = parseInt(Math.floor(game.days / 365));
                    submitNumber("Total years", m);
                    submitNumber("totaltp", parseInt(game.totalTPspent()));
                    submitNumber("Total Population", parseInt(game.totalPopulation()));
                    H()
                } else document.getElementById("impsave2") && (document.getElementById("impsave2").innerHTML = "Alternative Import: <span class='red_text'>Corrupted data</span>")
            } else document.getElementById("impsave2") && (document.getElementById("impsave2").innerHTML =
                "Alternative Import: <span class='red_text'>Invalid data</span>")
        });
        y();
        $("#profile_interface").show()
    }

    function Y(b, d, e, g) {
        currentInterface = "setAutoRouteInterface";
        currentUpdater = function () {};
        var h = parseInt(Math.floor(2 * planets[d].shortestPath[e].distance / (idleBon * b.speed()))),
            l = Math.floor(h / 60);
        l = "<div style='position:relative;left:16px;top:16px;'><span class='blue_text' style='font-size:120%'>Round Trip Time: </span><span class='white_text'>" + Math.floor(l / 60) % 60 + "h " + l % 60 + "m " + h % 60 + "s </span><span class='white_text'>(" +
            h + "s)</span><br><input type='checkbox' id='checkall' value='false'><span class='blue_text'>Check all Use%</span></input><div><div style='position:relative;left:16px;top:16px;'>";
        l = l + "<div style='float:left;margin:0;width:46%;'>" + ("<img src='img/" + planets[d].icon + "/" + planets[d].icon + ".png' class='icon' style='cursor:pointer;position:relative;top:8px;'/><span class='blue_text' style='font-size:150%'> " + planets[d].name + "</span><br><span class='blue_text'>Fleet storage: </span><span id='needed_storage0' class='white_text'>0</span><span class='white_text'>/" +
            beauty(b.maxStorage()) + "</span><span style='float:right;margin-righ:16px;' class='blue_text'>Select the amount of resources<br>you want to load in this planet</span><br><input type='checkbox' id='check100s' value='false'><span class='blue_text'>Check all 100%</span></input><br><br>");
        var m = planets[d].rawProduction(),
            n = Array(resNum);
        planets[d].importExport();
        for (var u = 0; u < resNum; u++) n[u] = planets[d].globalImport[u] - planets[d].globalExport[u];
        for (var t = 0; t < resNum; t++)
            if (resources[t].show(game) || 1 <= planets[d].resources[t]) l +=
                "<span class='blue_text' style='font-size:80%;'>" + resources[t].name.capitalize() + "</span><br><span class='blue_text' style='font-size:80%;' id='edit_auto_stock_source_" + t + "'>Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[d].resources[t]) + " <span class='" + (0 <= m[t] ? 0 < m[t] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < m[t] ? "+" : "") + "" + beauty(m[t]) + "/s)</span>", u = t, 0 != n[u] && (l += "<span class='" + (0 <= n[u] ? 0 < n[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < n[u] ?
                    "+" : "") + "" + beauty(n[u]) + "/s)</span>"), l += "</span></span><br><span class='blue_text' style='font-size:80%;' id='new_source_" + t + "'></span><span style='float:right;margin-righ:16px;' class='blue_text' id='source_val_" + t + "'><input type='checkbox' id='source_pct_" + t + "' name='" + t + "' value='false'>Use %        </input>(<input style='width:64px;height:12px;font-size:92%' id='res_slide0_" + t + "' name='" + t + "'type='text' value='0' />/s) <input style='width:80px' id='res_textval0_" + t + "' name='" + t + "' type='text' value='0'/></span><br><br>";
        l = l + "<span class='blue_text' style='font-size:120%'></span><br><br></div><div style='float:left;margin:0;width:4%;'><span class='blue_text' style='font-size:120%'></span><br><br></div><div style='float:left;margin:0;width:46%;'>" + ("<img src='img/" + planets[e].icon + "/" + planets[e].icon + ".png' class='icon' style='cursor:pointer;position:relative;top:8px;'/><span class='blue_text' style='font-size:150%'> " + planets[e].name + "</span><br><span class='blue_text'> Fleet storage: </span><span id='needed_storage1' class='white_text'>0</span><span class='white_text'>/" +
            beauty(b.maxStorage()) + "</span><span style='float:right;margin-righ:16px;'  class='blue_text'>Select the amount of resources<br>you want to load in this planet</span><br><input type='checkbox' id='check100d' value='false'><span class='blue_text'>Check all 100%</span></input><br><br>");
        m = planets[e].rawProduction();
        var K = Array(resNum);
        planets[e].importExport();
        for (u = 0; u < resNum; u++) K[u] = planets[e].globalImport[u] - planets[e].globalExport[u];
        for (t = 0; t < resNum; t++)
            if (resources[t].show(game) || 1 <= planets[e].resources[t]) l +=
                "<span class='blue_text' style='font-size:80%;'>" + resources[t].name.capitalize() + "</span><br><span class='blue_text' style='font-size:80%;' id='edit_auto_stock_dest_" + t + "'>Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[e].resources[t]) + " <span class='" + (0 <= m[t] ? 0 < m[t] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < m[t] ? "+" : "") + "" + beauty(m[t]) + "/s)</span>", u = t, 0 != K[u] && (l += "<span class='" + (0 <= K[u] ? 0 < K[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < K[u] ? "+" :
                    "") + "" + beauty(K[u]) + "/s)</span>"), l += "</span></span><br><span class='blue_text' style='font-size:80%;' id='new_dest_" + t + "'></span><span style='float:right;margin-righ:16px;'class='blue_text'><input type='checkbox' id='dest_pct_" + t + "' name='" + t + "' value='false'>Use %        </input>(<input style='width:64px;height:12px;font-size:92%' id='res_slide1_" + t + "' name='" + t + "' type='text' value='0' />/s) <input style='width:80px' id='res_textval1_" + t + "' name='" + t + "' type='text' value='0'/></span><br><br>";
        l += "<span class='blue_text' style='font-size:120%'></span><br><br></div></div><span class='blue_text button' id='but_setroute' style='font-size:120%;position:absolute;left:45%;bottom:0%;'>Create Route</span>";
        document.getElementById("profile_info_list") && (document.getElementById("profile_info_list").innerHTML = l);
        for (l = 0; l < resNum; l++) $("#res_slide0_" + l).change(function () {
            Number.isInteger(1E3 * Math.floor(parseInt($(this).val()))) || $(this).val(0);
            $("#res_textval0_" + $(this).attr("name")).val(parseInt(parseFloat($(this).val()) *
                h));
            currentUpdater()
        }), $("#res_textval0_" + l).change(function () {
            Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > $("#res_slide0_" + $(this).attr("name")).attr("max") && $(this).val($("#res_slide0_" + $(this).attr("name")).attr("max")) : $(this).val(0);
            $("#res_slide0_" + $(this).attr("name")).val(parseInt($(this).val()) / h);
            currentUpdater()
        }), $("#res_slide1_" + l).change(function () {
            Number.isInteger(1E3 * Math.floor(parseInt($(this).val()))) || $(this).val(0);
            $("#res_textval1_" + $(this).attr("name")).val(parseInt(parseFloat($(this).val()) *
                h));
            currentUpdater()
        }), $("#res_textval1_" + l).change(function () {
            Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > $("#res_slide1_" + $(this).attr("name")).attr("max") && $(this).val($("#res_slide1_" + $(this).attr("name")).attr("max")) : $(this).val(0);
            $("#res_slide1_" + $(this).attr("name")).val(parseInt($(this).val()) / h);
            currentUpdater()
        }), $("#source_pct_" + l).change(function () {
            var d = $(this).attr("name");
            $("#dest_pct_" + d).prop("checked", this.checked);
            (b.autoPct[d] = this.checked) ? ($("#res_slide0_" +
                d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
        }), $("#dest_pct_" + l).change(function () {
            var d = $(this).attr("name");
            $("#source_pct_" + d).prop("checked", this.checked);
            (b.autoPct[d] = this.checked) ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
        });
        $("#checkall").change(function () {
            for (var d = 0; d < resNum; d++) $("#dest_pct_" + d).prop("checked", this.checked), $("#source_pct_" + d).prop("checked", this.checked),
                b.autoPct[d] = this.checked, $("#res_textval0_" + d).val("0"), $("#res_textval1_" + d).val("0"), this.checked ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
        });
        $("#check100s").change(function () {
            if (!$("#checkall").prop("checked")) {
                $("#checkall").prop("checked", !0);
                for (var d = 0; d < resNum; d++) $("#dest_pct_" + d).prop("checked", this.checked), $("#source_pct_" + d).prop("checked", this.checked), b.autoPct[d] = this.checked, $("#res_textval0_" + d).val("0"), $("#res_textval1_" +
                    d).val("0"), this.checked ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
            }
            for (d = 0; d < resNum; d++) $("#res_textval0_" + d).val("100")
        });
        $("#check100d").change(function () {
            if (!$("#checkall").prop("checked")) {
                $("#checkall").prop("checked", !0);
                for (var d = 0; d < resNum; d++) $("#dest_pct_" + d).prop("checked", this.checked), $("#source_pct_" + d).prop("checked", this.checked), b.autoPct[d] = this.checked, $("#res_textval0_" + d).val("0"), $("#res_textval1_" + d).val("0"),
                    this.checked ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
            }
            for (d = 0; d < resNum; d++) $("#res_textval1_" + d).val("100")
        });
        currentUpdater = function () {
            for (var g = planets[d].rawProduction(), l = planets[e].rawProduction(), m = 0; m < resNum; m++)
                if (resources[m].show(game) || 1 <= planets[e].resources[m]) {
                    var u = m,
                        t = "",
                        w = "";
                    0 != n[u] && (t += "<span class='" + (0 <= n[u] ? 0 < n[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < n[u] ? "+" : "") + "" + beauty(n[u]) + "/s)</span>");
                    0 != K[u] && (w += "<span class='" + (0 <= K[u] ? 0 < K[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < K[u] ? "+" : "") + "" + beauty(K[u]) + "/s)</span>");
                    document.getElementById("edit_auto_stock_dest_" + m) && (document.getElementById("edit_auto_stock_dest_" + m).innerHTML = "Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[e].resources[m]) + " <span class='" + (0 <= l[m] ? 0 < l[m] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < l[m] ? "+" : "") + "" + beauty(l[m]) + "/s)</span>" + w + "</span>");
                    document.getElementById("edit_auto_stock_source_" +
                        m) && (document.getElementById("edit_auto_stock_source_" + m).innerHTML = "Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[d].resources[m]) + " <span class='" + (0 <= g[m] ? 0 < g[m] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < g[m] ? "+" : "") + "" + beauty(g[m]) + "/s)</span>" + t + "</span>");
                    w = t = 0;
                    $("#res_textval0_" + m).val() && (b.autoPct[m] ? 0 < planets[d].globalRaw[m] ? t += planets[d].globalRaw[m] * parseFloat($("#res_textval0_" + m).val()) / 100 * h / idleBon : w -= planets[d].globalRaw[m] * parseFloat($("#res_textval0_" +
                        m).val()) / 100 * h / idleBon : t += parseInt($("#res_textval0_" + m).val()));
                    $("#res_textval1_" + m).val() && (b.autoPct[m] ? 0 < planets[e].globalRaw[m] ? w += planets[e].globalRaw[m] * parseFloat($("#res_textval1_" + m).val()) / 100 * h / idleBon : t -= planets[e].globalRaw[m] * parseFloat($("#res_textval1_" + m).val()) / 100 * h / idleBon : w = parseInt($("#res_textval1_" + m).val()));
                    u = (-t + w) / h * idleBon;
                    t = (-w + t) / h * idleBon;
                    document.getElementById("new_source_" + m) && (document.getElementById("new_source_" + m).innerHTML = "This fleet will give: <span class='white_text' style='font-size:100%;'><span class='" +
                        (0 <= u ? 0 < u ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < u ? "+" : "") + "" + beauty(u) + "/s)</span>");
                    document.getElementById("new_dest_" + m) && (document.getElementById("new_dest_" + m).innerHTML = "This fleet will give: <span class='white_text' style='font-size:100%;'><span class='" + (0 <= t ? 0 < t ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < t ? "+" : "") + "" + beauty(t) + "/s)</span>")
                }
            for (m = l = g = 0; m < resNum; m++) $("#res_textval0_" + m).val() && (b.autoPct[m] ? 0 > planets[d].globalRaw[m] ? l += -parseFloat($("#res_textval0_" + m).val()) /
                100 * planets[d].globalRaw[m] * h : g += parseFloat($("#res_textval0_" + m).val()) / 100 * planets[d].globalRaw[m] * h : g += parseInt($("#res_textval0_" + m).val())), $("#res_textval1_" + m).val() && (b.autoPct[m] ? 0 > planets[e].globalRaw[m] ? g += -parseFloat($("#res_textval1_" + m).val()) / 100 * planets[e].globalRaw[m] * h : l += parseFloat($("#res_textval1_" + m).val()) / 100 * planets[e].globalRaw[m] * h : l += parseInt($("#res_textval1_" + m).val()));
            g = Math.floor(g);
            l = Math.floor(l);
            $("#needed_storage0").html(beauty(g));
            $("#needed_storage1").html(beauty(l))
        };
        $("#but_setroute").unbind();
        $("#but_setroute").click(function () {
            for (var l = 0, m = 0, u = 0; u < resNum; u++) $("#res_textval0_" + u).val() && (b.autoPct[u] ? 0 > planets[d].globalRaw[u] ? m += -parseFloat($("#res_textval0_" + u).val()) / 100 * planets[d].globalRaw[u] * h : l += parseFloat($("#res_textval0_" + u).val()) / 100 * planets[d].globalRaw[u] * h : l += parseInt($("#res_textval0_" + u).val())), $("#res_textval1_" + u).val() && (b.autoPct[u] ? 0 > planets[e].globalRaw[u] ? l += -parseFloat($("#res_textval1_" + u).val()) / 100 * planets[e].globalRaw[u] * h : m +=
                parseFloat($("#res_textval1_" + u).val()) / 100 * planets[e].globalRaw[u] * h : m += parseInt($("#res_textval1_" + u).val()));
            l = Math.floor(l);
            m = Math.floor(m);
            if (l <= b.availableStorage())
                if (m <= b.availableStorage()) {
                    b.autoMap[d] = 0;
                    b.autoMap[e] = 1;
                    for (u = 0; u < resNum; u++) $("#res_textval1_" + u).val() ? (l = parseInt($("#res_textval1_" + u).val()), b.autoPct[u] && (l = 100 * parseFloat($("#res_textval1_" + u).val())), b.autoRes[b.autoMap[e]][u] = l) : b.autoRes[b.autoMap[e]][u] = 0, $("#res_textval0_" + u).val() ? (l = parseInt($("#res_textval0_" + u).val()),
                        b.autoRes[b.autoMap[d]][u] = l, b.autoPct[u] && (l = 100 * parseFloat($("#res_textval0_" + u).val()), b.autoRes[b.autoMap[d]][u] = l, l = Math.floor(h * (b.autoRes[b.autoMap[d]][u] * Math.max(planets[d].globalRaw[u], 0) + b.autoRes[b.autoMap[e]][u] * Math.max(-planets[e].globalRaw[u], 0)) / 1E4)), l = Math.min(l, planets[d].resources[u]), 0 < l && b.load(u, l) && planets[d].resourcesAdd(u, -l)) : b.autoRes[b.autoMap[d]][u] = 0;
                    b.type = "auto";
                    b.move(d, e);
                    delete planets[d].fleets[g];
                    U("auto")
                } else u = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough storage to load resources in " +
                    planets[e].name + "!</span>", "info"), u.drawToast();
            else u = new v(210, 0, "<br><span class='red_text red_text_shadow'>Not enough storage to load resources in " + planets[d].name + "!</span>", "info"), u.drawToast()
        });
        y();
        $("#profile_interface").show()
    }

    function W(b, d, e) {
        currentInterface = "editAutoRouteInterface";
        currentUpdater = function () {};
        var g = parseInt(Math.floor(2 * planets[d].shortestPath[e].distance / (b.speed() * idleBon))),
            h = Math.floor(g / 60);
        h = "<div style='position:relative;left:16px;top:16px;'><span class='blue_text' style='font-size:120%'>Round Trip Time: </span><span class='white_text'>" +
            Math.floor(h / 60) % 60 + "h " + h % 60 + "m " + g % 60 + "s </span><span class='white_text'>(" + g + "s)</span><br><span class='blue_text' style='font-size:120%'>Fleet Name: </span><span class='white_text'>" + b.name + "</span><br><input type='checkbox' id='checkall'><span class='blue_text'>Check all Use%</span></input><div>";
        h = h + "<div style='position:relative;left:16px;top:16px;'><div style='float:left;margin:0;width:46%;'>" + ("<img src='img/" + planets[d].icon + "/" + planets[d].icon + ".png' class='icon' style='cursor:pointer;position:relative;top:8px;'/><span class='blue_text' style='font-size:150%'> " +
            planets[d].name + "</span><br><span class='blue_text'>Fleet storage: </span><span id='needed_storage0' class='white_text'>0</span><span class='white_text'>/" + beauty(b.maxStorage()) + "</span><span style='float:right;margin-righ:16px;' class='blue_text'>Select the amount of resources<br>you want to load in this planet</span><br><input type='checkbox' id='check100s' value='false'><span class='blue_text'>Check all 100%</span></input><br><br><br>");
        var l = planets[d].rawProduction(),
            m = Array(resNum);
        planets[d].importExport();
        for (var u = 0; u < resNum; u++) m[u] = planets[d].globalImport[u] - planets[d].globalExport[u];
        for (var n = 0; n < resNum; n++)
            if (resources[n].show(game) || 1 <= planets[d].resources[n]) h += "<span class='blue_text' style='font-size:80%;'>" + resources[n].name.capitalize() + "</span><br><span class='blue_text' style='font-size:80%;' id='edit_auto_stock_source_" + n + "'>Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[d].resources[n]) + " <span class='" + (0 <= l[n] ? 0 < l[n] ? "green_text" : "gray_text" : "red_text") +
                "'>(" + (0 < l[n] ? "+" : "") + "" + beauty(l[n]) + "/s)</span>", u = n, 0 != m[u] && (h += "<span class='" + (0 <= m[u] ? 0 < m[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < m[u] ? "+" : "") + "" + beauty(m[u]) + "/s)</span>"), h += "</span></span><br><span class='blue_text' style='font-size:80%;' id='new_source_" + n + "'></span><span style='float:right;margin-righ:16px;' class='blue_text'><input type='checkbox' id='source_pct_" + n + "' name='" + n + "' value='false'>Use %        </input>(<input style='width:64px;height:12px;font-size:92%' id='res_slide0_" +
                n + "' name='" + n + "' type='text' value='0'/>/s) <input style='width:80px' id='res_textval0_" + n + "' name='" + n + "' type='text' value='0'/></span><br><br>";
        h = h + "<span class='blue_text' style='font-size:120%'></span><br><br></div><div style='float:left;margin:0;width:4%;'><span class='blue_text' style='font-size:120%'></span><br><br></div><div style='float:left;margin:0;width:46%;'>" + ("<img src='img/" + planets[e].icon + "/" + planets[e].icon + ".png' class='icon' style='cursor:pointer;position:relative;top:8px;'/><span class='blue_text' style='font-size:150%'> " +
            planets[e].name + "</span><br><span class='blue_text'> Fleet storage: </span><span id='needed_storage1' class='white_text'>0</span><span class='white_text'>/" + beauty(b.maxStorage()) + "</span><span style='float:right;margin-righ:16px;'  class='blue_text'>Select the amount of resources<br>you want to load in this planet</span><br><input type='checkbox' id='check100d' value='false'><span class='blue_text'>Check all 100%</span></input><br><br><br>");
        l = planets[e].rawProduction();
        var t = Array(resNum);
        planets[e].importExport();
        for (u = 0; u < resNum; u++) t[u] = planets[e].globalImport[u] - planets[e].globalExport[u];
        for (n = 0; n < resNum; n++)
            if (resources[n].show(game) || 1 <= planets[e].resources[n]) h += "<span class='blue_text' style='font-size:80%;'>" + resources[n].name.capitalize() + "</span><br><span class='blue_text' style='font-size:80%;' id='edit_auto_stock_dest_" + n + "'>Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[e].resources[n]) + " <span class='" + (0 <= l[n] ? 0 < l[n] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 <
                    l[n] ? "+" : "") + "" + beauty(l[n]) + "/s)</span>", u = n, 0 != t[u] && (h += "<span class='" + (0 <= t[u] ? 0 < t[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < t[u] ? "+" : "") + "" + beauty(t[u]) + "/s)</span>"), h += "</span></span><br><span class='blue_text' style='font-size:80%;' id='new_dest_" + n + "'></span><span style='float:right;margin-righ:16px;' class='blue_text'><input type='checkbox' id='dest_pct_" + n + "' name='" + n + "' value='false'>Use %        </input>(<input style='width:64px;height:12px;font-size:92%' id='res_slide1_" +
                n + "' name='" + n + "' type='text' value='0'/>/s) <input style='width:80px' id='res_textval1_" + n + "' name='" + n + "' type='text' value='0'/></span><br><br>";
        h += "<span class='blue_text' style='font-size:120%'></span><br><br></div></div><span class='blue_text button' id='but_editroute' style='font-size:120%;position:absolute;left:45%;bottom:0%;'>Edit Route</span>";
        document.getElementById("profile_info_list") && (document.getElementById("profile_info_list").innerHTML = h);
        for (h = 0; h < resNum; h++) $("#res_slide0_" + h).change(function () {
            Number.isInteger(1E3 *
                Math.floor(parseInt($(this).val()))) || $(this).val(0);
            $("#res_textval0_" + $(this).attr("name")).val(parseInt(parseFloat($(this).val()) * g));
            currentUpdater()
        }), $("#res_textval0_" + h).change(function () {
            Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > $("#res_slide0_" + $(this).attr("name")).attr("max") && $(this).val($("#res_slide0_" + $(this).attr("name")).attr("max")) : $(this).val(0);
            $("#res_slide0_" + $(this).attr("name")).val(parseInt($(this).val()) / g);
            currentUpdater()
        }), $("#res_slide1_" + h).change(function () {
            Number.isInteger(1E3 *
                Math.floor(parseInt($(this).val()))) || $(this).val(0);
            $("#res_textval1_" + $(this).attr("name")).val(parseInt(parseFloat($(this).val()) * g));
            currentUpdater()
        }), $("#res_textval1_" + h).change(function () {
            Number.isInteger(parseInt($(this).val())) ? parseInt($(this).val()) > $("#res_slide1_" + $(this).attr("name")).attr("max") && $(this).val($("#res_slide1_" + $(this).attr("name")).attr("max")) : $(this).val(0);
            $("#res_slide1_" + $(this).attr("name")).val(parseInt($(this).val()) / g);
            currentUpdater()
        }), b.autoPct[h] ? ($("#res_textval0_" +
            h).val(Math.floor(b.autoRes[b.autoMap[d]][h]) / 100), $("#res_textval1_" + h).val(Math.floor(b.autoRes[b.autoMap[e]][h]) / 100)) : ($("#res_slide0_" + h).val(Math.floor(1E3 * b.autoRes[b.autoMap[d]][h] / g) / 1E3), $("#res_slide1_" + h).val(Math.floor(1E3 * b.autoRes[b.autoMap[e]][h] / g) / 1E3), $("#res_textval0_" + h).val(b.autoRes[b.autoMap[d]][h]), $("#res_textval1_" + h).val(b.autoRes[b.autoMap[e]][h])), b.autoPct[h] ? ($("#source_pct_" + h).prop("checked", !0), $("#dest_pct_" + h).prop("checked", !0)) : ($("#source_pct_" + h).prop("checked", !1), $("#dest_pct_" + h).prop("checked", !1)), $("#source_pct_" + h).change(function () {
            var d = $(this).attr("name");
            $("#dest_pct_" + d).prop("checked", this.checked);
            (b.autoPct[d] = this.checked) ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
        }), $("#dest_pct_" + h).change(function () {
            var d = $(this).attr("name");
            $("#source_pct_" + d).prop("checked", this.checked);
            (b.autoPct[d] = this.checked) ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" +
                d).show(), $("#res_slide1_" + d).show())
        }), b.autoPct[h] ? ($("#res_slide0_" + h).hide(), $("#res_slide1_" + h).hide()) : ($("#res_slide0_" + h).show(), $("#res_slide1_" + h).show());
        $("#checkall").change(function () {
            for (var d = 0; d < resNum; d++) $("#dest_pct_" + d).prop("checked", this.checked), $("#source_pct_" + d).prop("checked", this.checked), b.autoPct[d] = this.checked, $("#res_textval0_" + d).val("0"), $("#res_textval1_" + d).val("0"), this.checked ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(),
                $("#res_slide1_" + d).show())
        });
        $("#check100s").change(function () {
            if (!$("#checkall").prop("checked")) {
                $("#checkall").prop("checked", !0);
                for (var d = 0; d < resNum; d++) $("#dest_pct_" + d).prop("checked", this.checked), $("#source_pct_" + d).prop("checked", this.checked), b.autoPct[d] = this.checked, $("#res_textval0_" + d).val("0"), $("#res_textval1_" + d).val("0"), this.checked ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
            }
            for (d = 0; d < resNum; d++) $("#res_textval0_" +
                d).val("100")
        });
        $("#check100d").change(function () {
            if (!$("#checkall").prop("checked")) {
                $("#checkall").prop("checked", !0);
                for (var d = 0; d < resNum; d++) $("#dest_pct_" + d).prop("checked", this.checked), $("#source_pct_" + d).prop("checked", this.checked), b.autoPct[d] = this.checked, $("#res_textval0_" + d).val("0"), $("#res_textval1_" + d).val("0"), this.checked ? ($("#res_slide0_" + d).hide(), $("#res_slide1_" + d).hide()) : ($("#res_slide0_" + d).show(), $("#res_slide1_" + d).show())
            }
            for (d = 0; d < resNum; d++) $("#res_textval1_" + d).val("100")
        });
        currentUpdater = function () {
            for (var h = planets[d].rawProduction(), l = planets[e].rawProduction(), n = 0; n < resNum; n++)
                if (resources[n].show(game) || 1 <= planets[e].resources[n]) {
                    var u = n,
                        v = "",
                        w = "";
                    0 != m[u] && (v += "<span class='" + (0 <= m[u] ? 0 < m[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < m[u] ? "+" : "") + "" + beauty(m[u]) + "/s)</span>");
                    0 != t[u] && (w += "<span class='" + (0 <= t[u] ? 0 < t[u] ? "purple_text" : "gray_text" : "pink_text oblique_txt") + "'> (" + (0 < t[u] ? "+" : "") + "" + beauty(t[u]) + "/s)</span>");
                    document.getElementById("edit_auto_stock_dest_" +
                        n) && (document.getElementById("edit_auto_stock_dest_" + n).innerHTML = "Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[e].resources[n]) + " <span class='" + (0 <= l[n] ? 0 < l[n] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < l[n] ? "+" : "") + "" + beauty(l[n]) + "/s)</span>" + w + "</span>");
                    document.getElementById("edit_auto_stock_source_" + n) && (document.getElementById("edit_auto_stock_source_" + n).innerHTML = "Stock: <span class='white_text' style='font-size:100%;'> " + beauty(planets[d].resources[n]) +
                        " <span class='" + (0 <= h[n] ? 0 < h[n] ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < h[n] ? "+" : "") + "" + beauty(h[n]) + "/s)</span>" + v + "</span>");
                    w = v = 0;
                    $("#res_textval0_" + n).val() && (b.autoPct[n] ? 0 < planets[d].globalRaw[n] ? v += planets[d].globalRaw[n] * parseFloat($("#res_textval0_" + n).val()) / 100 * g / idleBon : w += -planets[d].globalRaw[n] * parseFloat($("#res_textval0_" + n).val()) / 100 * g / idleBon : v = parseInt($("#res_textval0_" + n).val()));
                    $("#res_textval1_" + n).val() && (b.autoPct[n] ? planets[e].globalRaw[n] ? w += planets[e].globalRaw[n] *
                        parseFloat($("#res_textval1_" + n).val()) / 100 * g / idleBon : v += -planets[e].globalRaw[n] * parseFloat($("#res_textval1_" + n).val()) / 100 * g / idleBon : w = parseInt($("#res_textval1_" + n).val()));
                    u = (-v + w) / g * idleBon;
                    v = (-w + v) / g * idleBon;
                    document.getElementById("new_source_" + n) && (document.getElementById("new_source_" + n).innerHTML = "This fleet will give: <span class='white_text' style='font-size:100%;'><span class='" + (0 <= u ? 0 < u ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < u ? "+" : "") + "" + beauty(u) + "/s)</span>");
                    document.getElementById("new_dest_" +
                        n) && (document.getElementById("new_dest_" + n).innerHTML = "This fleet will give: <span class='white_text' style='font-size:100%;'><span class='" + (0 <= v ? 0 < v ? "green_text" : "gray_text" : "red_text") + "'>(" + (0 < v ? "+" : "") + "" + beauty(v) + "/s)</span>")
                }
            for (n = l = h = 0; n < resNum; n++) $("#res_textval0_" + n).val() && (b.autoPct[n] ? 0 > planets[d].globalRaw[n] ? l += -parseFloat($("#res_textval0_" + n).val()) / 100 * planets[d].globalRaw[n] * g : h += parseFloat($("#res_textval0_" + n).val()) / 100 * planets[d].globalRaw[n] * g : h += parseInt($("#res_textval0_" +
                n).val())), $("#res_textval1_" + n).val() && (b.autoPct[n] ? 0 > planets[e].globalRaw[n] ? h += -parseFloat($("#res_textval1_" + n).val()) / 100 * planets[e].globalRaw[n] * g : l += parseFloat($("#res_textval1_" + n).val()) / 100 * planets[e].globalRaw[n] * g : l += parseInt($("#res_textval1_" + n).val()));
            h = Math.floor(h);
            l = Math.floor(l);
            $("#needed_storage0").html(beauty(h));
            $("#needed_storage1").html(beauty(l))
        };
        $("#but_editroute").unbind();
        $("#but_editroute").click(function () {
            for (var h = 0, l = 0, m = 0; m < resNum; m++) $("#res_textval0_" + m).val() &&
                (b.autoPct[m] ? 0 > planets[d].globalRaw[m] ? l += -parseFloat($("#res_textval0_" + m).val()) / 100 * planets[d].globalRaw[m] * g : h += parseFloat($("#res_textval0_" + m).val()) / 100 * planets[d].globalRaw[m] * g : h += parseInt($("#res_textval0_" + m).val())), $("#res_textval1_" + m).val() && (b.autoPct[m] ? 0 > planets[e].globalRaw[m] ? h += -parseFloat($("#res_textval1_" + m).val()) / 100 * planets[e].globalRaw[m] * g : l += parseFloat($("#res_textval1_" + m).val()) / 100 * planets[e].globalRaw[m] * g : l += parseInt($("#res_textval1_" + m).val()));
            h = Math.floor(h);
            l = Math.floor(l);
            if (h <= b.maxStorage())
                if (l <= b.maxStorage()) {
                    b.autoMap[d] = 0;
                    b.autoMap[e] = 1;
                    for (m = 0; m < resNum; m++) $("#res_textval0_" + m).val() ? (h = parseInt($("#res_textval0_" + m).val()), b.autoPct[m] && (h = 100 * parseFloat($("#res_textval0_" + m).val())), b.autoRes[b.autoMap[d]][m] = h) : b.autoRes[b.autoMap[d]][m] = 0, $("#res_textval1_" + m).val() ? (h = parseInt($("#res_textval1_" + m).val()), b.autoPct[m] && (h = 100 * parseFloat($("#res_textval1_" + m).val())), b.autoRes[b.autoMap[e]][m] = h) : b.autoRes[b.autoMap[e]][m] = 0;
                    b.type = "auto";
                    U(currentCriteriaAuto)
                } else m = new v(210, 0, "<span class='red_text red_text_shadow'>Not enough storage to load resources in " + planets[e].name + "!</span>", "info"), m.drawToast();
            else m = new v(210, 0, "<br><span class='red_text red_text_shadow'>Not enough storage to load resources in " + planets[d].name + "!</span>", "info"), m.drawToast()
        });
        y();
        $("#profile_interface").show()
    }
    console.log("[Version] " + GAME_VERSION + "" + GAME_SUB_VERSION);
    loadReset = e;
    document.getElementById("l_info") && (document.getElementById("l_info").innerHTML =
        "Loading engine...");
    $("#loading_bar").css("width", "33%");
    exportUpdateBuildingList = m;
    var Z = (new Date).getTime();
    exportMain = F;
    exportButton = z;
    exportPopup = v;
    exportPermanentMenu = H;
    exportPlanetInterface = A;
    exportShipyardInterface = n;
    exportTechInterface = G;
    exportResearchInterface = ba;
    exportShipInterface = M;
    exportTravelingShipInterface = U;
    exportShipInterface = M;
    overviewPlanetExpand = Array(planets.length);
    overviewResourceExpand = Array(planets.length);
    overviewRoutesExpand = Array(planets.length);
    for (var P = 0; P < planets.length; P++) {
        overviewPlanetExpand[P] = !1;
        overviewRoutesExpand[P] = !1;
        overviewResourceExpand[P] = Array(resNum);
        for (var R = 0; R < resNum; R++) overviewResourceExpand[P][R] = !1;
        overviewResourceExpand[P].energy = !1;
        overviewResourceExpand[P].research = !1
    }
    overviewPlanetExpand.empire = !1;
    overviewResourceExpand.empire = Array(resNum);
    for (R = 0; R < resNum; R++) overviewResourceExpand.empire[R] = !1;
    overviewResourceExpand.empire.research = !1;
    exportExpInterface = da;
    document.getElementById("l_info") && (document.getElementById("l_info").innerHTML = "Loading interface...");
    try {
        window.localStorage && console.log("ok")
    } catch (u) {
        document.getElementById("l_info") && (document.getElementById("l_info").innerHTML = "Cookies disabled! Please enable them or you won't be able to save the game")
    }
    $("#l_info").click(wipeData);
    $("#loading_bar").css("width", "67%");
    document.getElementById("topbar_name") && (document.getElementById("topbar_name").innerHTML = game.playerName);
    saveBase();
    (function () {
        if ("undefined" !== typeof Storage)
            if (null != localStorage.getItem("HGsv0cpt") && null != localStorage.getItem("HGsv0plt") &&
                null != localStorage.getItem("HGsv0civ")) {
                firstTime = !1;
                "true" == localStorage.getItem("HGsv0first") && (firstTime = !0);
                if (null != localStorage.getItem("HGsv0vers")) {
                    var d = JSON.parse(decodeURIComponent(atob(localStorage.getItem("HGsv0civ"))));
                    capital = parseInt(atob(localStorage.getItem("HGsv0cpt")));
                    var e = JSON.parse(decodeURIComponent(atob(localStorage.getItem("HGsv0plt"))));
                    var g = JSON.parse(decodeURIComponent(atob(localStorage.getItem("HGsv0sch"))))
                } else d = JSON.parse(atob(localStorage.getItem("HGsv0civ"))),
                    capital = parseInt(atob(localStorage.getItem("HGsv0cpt"))), e = JSON.parse(atob(localStorage.getItem("HGsv0plt"))), g = JSON.parse(atob(localStorage.getItem("HGsv0sch")));
                for (var h = 0; h < d.length; h++) civisLoader(civis[h], d[h], civis[h].name);
                g.st && settingsLoader(g.st);
                game = civis[gameSettings.civis];
                for (h = 0; h < e.length; h++) e[h] && planetLoader(planets[h], e[h]);
                fleetSchedule.count = g.count;
                d = 0;
                for (var l in g.fleets) d++;
                fleetSchedule.load(g.schedule, g.fleets, d);
                g.m && market.load(g.m);
                g.qur && (g.qur.points && (qurisTournament.points =
                    g.qur.points || 0), g.qur.lose && (qurisTournament.lose = g.qur.lose || 0));
                if (g.art)
                    for (var m in g.art) artifacts[artifactsName[m]].collect();
                if (g.qst)
                    for (var n in g.qst) quests[questNames[n]].done = !0;
                if (g.plc)
                    for (n in g.plc) places[placesNames[n]].done = !0;
                if (g.tuts)
                    for (n in g.tuts) tutorials[tutorialsNames[n]].done = !0;
                game.searchPlanet(planetsName.virgo) || (planets[planetsName.virgo].setCivis(8), civis[8].capital = planetsName.virgo);
                game.searchPlanet(planetsName.nassaus) || (planets[planetsName.nassaus].setCivis(7),
                    civis[7].capital = planetsName.nassaus);
                setIdleBonus();
                setTimeout(function () {
                    submitNumber("Number of planets", game.planets.length);
                    submitNumber("Infuence", game.influence());
                    var d = b();
                    submitNumber("Military Value", d);
                    submitNumber("Number of time travels", game.timeTravelNum);
                    d = parseInt(Math.floor(game.days / 365));
                    submitNumber("Total years", d);
                    submitNumber("totaltp", parseInt(game.totalTPspent()));
                    submitNumber("Total Population", parseInt(game.totalPopulation()))
                }, 5E3)
            } else console.log("No data to load");
        else console.log("Unable to load game!")
    })();
    $("#menu_icon").click(H);
    $("#planet_list_button").click(ia);
    $("#building_button").click(I);
    $("#research_button").click(ba);
    $("#map_button").click(function () {
        0 < game.researches[researchesName.astronomy].level ? S(currentNebula) : (new v(220, 0, "<span class='white_text'>You must research </span><br><span class='blue_text text_shadow'>Interstellar Travel</span>!", "info")).drawToast()
    });
    $("#quest_button").click(function () {
        currentInterface = "questInterface";
        currentUpdater =
            function () {};
        for (var b in game.acceptedQuest);
        document.getElementById("quest_list") && (document.getElementById("quest_list").innerHTML = "");
        y();
        $("#quest_interface").show()
    });
    $("#ship_button").click(function () {
        0 < game.researches[researchesName.astronomy].level ? M(currentCriteria) : (new v(220, 0, "<span class='white_text'>You must research </span><br><span class='blue_text text_shadow'>Interstellar Travel</span>!", "info")).drawToast()
    });
    $("#extraction_button").click(function () {
        B("mining", currentPlanet)
    });
    $("#production_button").click(function () {
        B("prod", currentPlanet)
    });
    $("#energy_button").click(function () {
        B("energy", currentPlanet)
    });
    $("#defence_button").click(function () {
        A(currentPlanet)
    });
    $("#shipyard_button").click(function () {
        n(currentPlanet)
    });
    $("#other_button").click(function () {
        B("other", currentPlanet)
    });
    $("#settings_save").click(function () {
        soundSetting = $("#sound_check").prop("checked") ? !0 : !1;
        musicSetting = $("#music_check").prop("checked") ? !0 : !1
    });
    $("#settings_icon").click(function () {
        currentInterface =
            "settingsInterface";
        autosave ? $("#autosave_check").prop("checked", !0) : $("#autosave_check").prop("checked", !1);
        soundSetting ? $("#sound_check").prop("checked", !0) : $("#sound_check").prop("checked", !1);
        musicSetting ? $("#music_check").prop("checked", !0) : $("#music_check").prop("checked", !1);
        y();
        $("#settings_interface").show();
        $("#back_button").unbind();
        $("#back_button").click(H);
        $("#back_button").show()
    });
    $("#export_icon").click(function () {
        da()
    });
    $("#export_icon").hover(function () {
        (new v(128, 10, "<span class='blue_text' style='width:100%;text-align:center'>Save Export</span>",
            "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#export_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#save_icon").click(function () {
        save()
    });
    $("#save_icon").hover(function () {
        (new v(50, 10, "<span class='blue_text' style='width:100%;text-align:center'>Save</span>", "info")).drawInfo();
        $(document).on("mousemove",
            function (b) {
                mouseX = b.pageX + 16;
                mouseY = b.pageY + 10;
                $("#popup_info").css({
                    left: mouseX,
                    top: mouseY
                })
            });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#save_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#info_icon").click(function () {
        ka()
    });
    $("#info_icon").hover(function () {
        (new v(48, 10, "<span class='blue_text' style='width:100%;text-align:center'>Info</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY =
                b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#info_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#tutorial_icon").click(function () {
        gameSettings.hideTutorial = !1;
        if (0 <= getAvailableTutorial() - 1) {
            var b = tutorials[getAvailableTutorial() - 1];
            b && !gameSettings.hideTutorial && (b.done = !1, tutorialChecker(!0))
        }
    });
    $("#b_fleet_icon").click(function () {
        0 < game.researches[researchesName.astronomy].level ?
            M(currentCriteria) : (new v(220, 0, "<span class='white_text'>You must research </span><br><span class='blue_text text_shadow'>Interstellar Travel</span>!", "info")).drawToast()
    });
    $("#b_fleet_icon").hover(function () {
        (new v(80, 10, "<span class='blue_text' style='width:100%;text-align:center'>Fleets</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_fleet_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_map_icon").click(function () {
        0 < game.researches[researchesName.astronomy].level ? S(currentNebula) : (new v(220, 0, "<span class='white_text'>You must research </span><br><span class='blue_text text_shadow'>Interstellar Travel</span>!", "info")).drawToast()
    });
    $("#b_map_icon").hover(function () {
        (new v(48, 10, "<span class='blue_text' style='width:100%;text-align:center'>Map</span>", "info")).drawInfo();
        $(document).on("mousemove",
            function (b) {
                mouseX = b.pageX + 16;
                mouseY = b.pageY + 10;
                $("#popup_info").css({
                    left: mouseX,
                    top: mouseY
                })
            });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_map_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_select_icon").click(ia);
    $("#b_select_icon").hover(function () {
        (new v(80, 10, "<span class='blue_text' style='width:100%;text-align:center'>Overview</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY =
                b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_select_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_extraction_icon").click(function () {
        B("mining", currentPlanet)
    });
    $("#b_extraction_icon").hover(function () {
        (new v(95, 10, "<span class='blue_text' style='width:100%;text-align:center'>Extraction</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX +
                16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_extraction_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_production_icon").click(function () {
        B("prod", currentPlanet)
    });
    $("#b_production_icon").hover(function () {
        (new v(96, 10, "<span class='blue_text' style='width:100%;text-align:center'>Production</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX =
                b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_production_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_energy_icon").click(function () {
        B("energy", currentPlanet)
    });
    $("#b_energy_icon").hover(function () {
        (new v(64, 10, "<span class='blue_text' style='width:100%;text-align:center'>Energy</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX =
                b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_energy_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_defence_icon").click(function () {
        A(currentPlanet)
    });
    $("#b_shipyard_icon").click(function () {
        n(currentPlanet)
    });
    $("#b_shipyard_icon").hover(function () {
        (new v(80, 10, "<span class='blue_text' style='width:100%;text-align:center'>Shipyard</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_shipyard_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_market_icon").click(function () {
        if (0 == currentPlanet.map)
            if (0 < currentPlanet.structure[buildingsName.tradehub].number) ja(currentPlanet);
            else {
                var b = new v(220, 0, "<span class='white_text'>You must build at least one </span><span class='blue_text text_shadow'>Trade Hub</span>!",
                    "info");
                b.drawToast()
            } else b = new v(220, 0, "<span class='red_text'>The trade hub is unable to contact a market in this map</span>!", "info"), b.drawToast()
    });
    $("#b_market_icon").hover(function () {
        (new v(64, 10, "<span class='blue_text' style='width:100%;text-align:center'>Market</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_market_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_other_icon").click(function () {
        B("other", currentPlanet)
    });
    $("#b_other_icon").hover(function () {
        (new v(110, 10, "<span class='blue_text' style='width:100%;text-align:center'>Other buildings</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_other_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_res_icon").click(function () {
        B("research", currentPlanet)
    });
    $("#b_res_icon").hover(function () {
        (new v(142, 10, "<span class='blue_text' style='width:100%;text-align:center'>Research buildings</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_res_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    $("#b_research_icon").click(ba);
    $("#b_research_icon").hover(function () {
        (new v(96, 10, "<span class='blue_text' style='width:100%;text-align:center'>Research</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_research_icon").mouseout(function () {
        $(document).on("mousemove",
            function () {})
    });
    $("#b_diplomacy_icon").click(function () {
        fa("news")
    });
    h("b_diplomacy_icon", "<span class='blue_text' style='width:100%;text-align:center'>Diplomacy</span>", 80);
    (4 > game.researches[3].level || 0 == game.timeTravelNum) && $("#b_diplomacy_icon").hide();
    $("#b_tournament_icon").click(function () {
        ha()
    });
    h("b_tournament_icon", "<span class='blue_text' style='width:100%;text-align:center'>Space Tournament</span>", 130);
    6 > game.researches[3].level && $("#b_tournament_icon").hide();
    $("#b_achievements_icon").click(function () {});
    $("#b_achievements_icon").hover(function () {
        (new v(120, 10, "<span class='blue_text' style='width:100%;text-align:center'>Achievements</span>", "info")).drawInfo();
        $(document).on("mousemove", function (b) {
            mouseX = b.pageX + 16;
            mouseY = b.pageY + 10;
            $("#popup_info").css({
                left: mouseX,
                top: mouseY
            })
        });
        $("#popup_info").css({
            left: mouseX,
            top: mouseY
        })
    }, function () {
        currentPopup.drop()
    });
    $("#b_achievements_icon").mouseout(function () {
        $(document).on("mousemove", function () {})
    });
    document.getElementById("l_info") && (document.getElementById("l_info").innerHTML =
        "Loading game...");
    $("#loading_bar").css("width", "100%");
    (function () {
        for (var b = !1, d = 0; d < ranks.length && !b;) ranks[d].requirement() ? game.playerRank = ranks[d] : b = !0, d++;
        $("#topbar_rank").attr("style", "font-family:'xolonium';color:#80c0ff;font-size:80%");
        document.getElementById("topbar_rank") && (document.getElementById("topbar_rank").innerHTML = "Player Name: ")
    })();
    A(currentPlanet);
    g();
    x();
    autosave && (autosaveTimer = window.setInterval(save, autosaveTime));
    mainTimer = window.setInterval(F, parseInt(1E3 / fpsFleet));
    exportLoadResetInternal = e;
    exportLoadResetInternal2 = d;
    exportPlanetBuildingInterface = B;
    exportDiplomacyInterface = fa;
    exportMapInterface = S;
    var O = {
        axis: "y",
        theme: "minimal",
        scrollInertia: 0,
        autoHideScrollbar: !1
    };
    $("#building_list_container").mCustomScrollbar(O);
    $("#shipyard_list_container").mCustomScrollbar(O);
    $("#market_list_container").mCustomScrollbar(O);
    $("#ship_list_container").mCustomScrollbar(O);
    $("#planet_selection_interface").mCustomScrollbar(O);
    $("#map_container").mCustomScrollbar({
        axis: "xy",
        theme: "minimal",
        scrollInertia: 0
    });
    $("#tech_container").mCustomScrollbar({
        axis: "xy",
        theme: "minimal",
        scrollInertia: 0
    });
    $("#research_interface").mCustomScrollbar(O);
    $("#quest_interface").mCustomScrollbar(O);
    $("#diplomacy_list_container").mCustomScrollbar(O);
    $("#profile_interface").mCustomScrollbar(O);
    $("#planet_info").mCustomScrollbar(O);
    $("#planet_info2").mCustomScrollbar(O);
    $("#planet_mini").mCustomScrollbar(O);
    $("#building_info").mCustomScrollbar(O);
    $("#shipyard_info").mCustomScrollbar(O);
    $("#shipyard_mini").mCustomScrollbar(O);
    $("#market_info").mCustomScrollbar(O);
    $("#market_mini").mCustomScrollbar(O);
    $("#diplomacy_mini").mCustomScrollbar(O);
    $("#ship_info").mCustomScrollbar(O);
    $("#ship_mini").mCustomScrollbar(O);
    $("#popup_content").mCustomScrollbar(O);
    $("#popup_container").hide();
    $("#popup_info").hide();
    $("#loading_screen").hide();
    $("body").on("mousewheel DOMMouseScroll", function (b) {
        var d = null;
        "mousewheel" === b.type ? d = -1 * b.originalEvent.wheelDelta : "DOMMouseScroll" === b.type && (d = 40 * b.originalEvent.detail);
        d && (b.preventDefault(),
            $(this).scrollTop(d + $(this).scrollTop()))
    });
    y();
    A(planets[game.planets[0]]);
    for (P = 0; P < planets.length; P++)
        if (game.searchPlanet(P)) planets[P].fleets.hub && planets[P].fleets.hub.unload(P);
        else {
            var ea = new Fleet(game.id, "div - hub");
            if (planets[P].fleets.hub) {
                for (R = 0; R < ships.length; R++) ea.ships[R] = planets[P].fleets.hub.ships[R], planets[P].fleets.hub.ships[R] = 0;
                if (0 < ea.shipNum()) {
                    for (R = 0; R < resNum; R++) ea.storage[R] = planets[P].fleets.hub.storage[R] || 0, planets[P].fleets.hub.storage[R] = 0;
                    planets[P].fleetPush(ea)
                }
            }
        }
    0 <
        getAvailableTutorial() && showPopupIdleBonus();
    $("#tuto_popup_start").click(function () {
        currentInterface = "tutorialInterface";
        var b = "<div style='position:relative;left:16px'><br><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>This is a little tutorial to help you start in Heart of Galaxy. These are only guidelines, so feel free to experiment yourself.</span><br><br><br><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>First steps</span><br><br>" + ("<span class='white_text'>The first step in </span><span class='blue_text'>Heart of Galaxy</span><span class='white_text'> is to set up a steady resource income. The first resource you will ever need is </span><span class='blue_text'>Iron</span><span class='white_text'>, that can be extracted with </span><span class='blue_text'>Mining Plant</span><span class='white_text'>. You can find the </span><span class='blue_text'>Mining Plant</span><span class='white_text'> building in the extraction tab (pickaxe icon): </span><span class='blue_text' id='here_mining' style='cursor:pointer;'>here</span><span class='white_text'>. You have to click on the building in the list, and then the button " +
            D("Build") + " in the menu on the right.</span><br><br>");
        b += "<span class='white_text'>Once you have a good iron production (about 15-20/s), you should start to extract another important resource, </span><span class='blue_text'>Methane</span><span class='white_text'>, by building a </span><span class='blue_text'>Methane Extractor</span><span class='white_text'> in the Extraction tab (same of " + D("Mining Plants") + "). </span><span class='blue_text'>Methane</span><span class='white_text'> is needed to produce </span><span class='blue_text'>Fuel</span><span class='white_text'> which some buildings consume in order to work. Once you have built enough </span><span class='blue_text'>Methane Extractors</span><span class='white_text'>, you can build a " +
            D("Methane Processer") + " to convert " + D("Methane") + " into " + D("Fuel") + ". You can find this building in the production tab (factory icon): </span><span class='blue_text' style='cursor:pointer;' id='here_methane'>here</span><br><br>";
        b += "<span class='white_text'>It is the moment to start producing " + D("Steel") + ". It is produced in " + D("Foundry") + " and consumes " + D("Graphite") + ", " + D("Iron") + " and " + D("Fuel") + ". If you followed the previous steps, you should have already set up " + D("Iron") + " and " + D("Fuel") +
            " production. As you probably figured out, you just need to build a " + D("Graphite Extractor") + " to produce " + D("Graphite") + ". Once you have enough production of these basic resources, you can build a working " + D("Foundry") + ".</span><br><br>";
        b = b + "<span class='white_text'>As you probably noticed, some buildings have negative production. That means that buildings will consume those resources over time. If these resources are not provided, the building will not produce anything! When there is a shortage of a certain resource, you can shut down some buildings or dismantle it in order to balance the production rate and keeping it positive.</span><br><br><br><br><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Energy</span><br><br>" +
            ("<span class='white_text'>" + D("Energy") + " is a special resource. It doesn't work like " + D("Iron") + " or " + D("Steel") + " since it only has to be produced and isn't cumulable. " + D("Energy") + " usage is divided in " + D("Production") + " and " + D("Consumption") + ". Unlike other resource, if production exceeds consumption, energy won't be consumed, instead, all buildings requiring energy to function will get a production malus proportional to the ratio production/consumption. It means, if you consume 1000 " +
                D("Energy") + " and acqually produce 100, all buildings that require energy will produce only 10% of what they are capable of. </span><br><br>");
        b += "<span class='white_text'>" + D("Energy") + " is produced from fuel in the early game. All you need is to build a " + D("Small Generator") + " in the energy tab (atom icon). The generator will produce a little amount of energy sufficient to support only few buildings.</span><br><br>";
        b = b + "<br><br><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Researches</span><br><br>" +
            ("<span class='white_text'>To improve buildings efficiency, and to unlock new ones, you need to invest " + D("Research Points") + " in the research tab: </span><span class='blue_text' id='here_research' style='cursor:pointer;'>here</span><span class='white_text'>. To produce " + D("Research Points") + " you need " + D("Laboratories") + " which can be built in the other tab (three points icon): </span><span class='blue_text' id='here_other' style='cursor:pointer;'>here</span><span class='white_text'>. " + D("Laboratories") +
                " are expensive to build but are necessary to improve your production. Also, they need " + D("Energy") + " to function.</span><br><br>");
        b += "<span class='white_text'>You should start to research " + D("Geology") + " and " + D("Material Science") + " since they improve basic construction resource production such as " + D("Iron") + " and " + D("Steel") + ". When you will research " + D("Geology V") + " you will unlock the " + D("Metal Collector") + ", which can be buit in the extraction tab. This buildings needs energy to function and will extract " +
            D("Titanium") + " and " + D("Uranium") + " (uranium extraction could change!). " + D("Titanium") + " is a resource needed for construction of advanced buildings and space ships. " + D("Uranium") + " will be used in the middle game to produce a great amount of energy, and in the future will be used as fuel for ships. When you will research " + D("Material Science 8") + " you will unlock " + D("Plastic Factory") + " which can be used to produce " + D("Plastic") + "</span><br><br>";
        b += "<span class='white_text'>You can continue researching to unlocks important buildings. Another important research is " +
            D("Chemical Engineering") + " which unlock the " + D("Thermal Power Plant") + " and " + D("Oil") + " extraction which can be converted in fuel more efficiently than " + D("Methane") + " and is required to produce advanced resources such as " + D("Plastic") + "</span><br><br>";
        b = b + "<br><br><span class='blue_text' style='float:left;margin-left:16px;font-size:120%;'>Your first colony</span><br><br>" + ("<span class='white_text'>The purpose of " + D("Heart of Galaxy") + " is not only to produce resources but to use them to colonize and conquer other planets. When you feel ready, you can research " +
            D("Interstellar Travel") + " which gives you the ability to explore the galactic map. It also unlock the " + D("Shipyard") + " where you can build " + D("Space Ships") + ". In order to build a ship, just select it and click " + D("Build") + " in the menu on the right, just like a buiding. When you leave the shipyard, ships will be automatically grouped together in a new fleet that you can interact with in the fleet menu. You can merge fleets together, you can divide them and move them to a particular planet. You can also load resources into it and unload them later on another planet. All these actions can be done using the quick buttons next to the fleet name, or if you left-click on the fleet, you can scroll the menu on the right (with the infos about the fleet) to find the action buttons.</span><br><br>");
        b += "<span class='white_text'>There are three main categories of space ships: " + D("Colonial Ships") + ", " + D("Cargo Ships") + " and " + D("War Ships") + ". " + D("Colonial Ships") + ", for instance the ship " + D("Vitha") + ", are the only ones that can colonize a planet. Don't try to move a cargo ship to a planet without a colony ship, it will be useless, since only a fleet with at least one colony ships will have the action Colonize in the info menu. Colony ships will be destroyed upon colonization! Also, colony ships do not have any storage and are really slow. Note that the speed of the entire fleet will be the minimum speed of its components ships.</span><br><br>";
        b += "<span class='white_text'>Colonizing and conquering other planets is useful to obtain uncommon resources which can be extracted only on some particular planets. " + D("Sand") + " for example, can be extracted only from " + D("Aequoreas") + " and " + D("Desert planets") + ". " + D("Ice") + " can only be extracted on " + D("Icy planets") + " (such as " + D("Vasilis") + ") and " + D("Hydrogen") + " can only be extracted on " + D("Gas Giants") + " (will eventually be available refining water...). You can see in the planet interface which resources can be extracted from a particular planet. If there is no 'resource xNN', it means that resource can't be extracted. For example " +
            D("Vasilis") + " is missing " + D("Graphite") + ", " + D("Promision") + " is missing " + D("Ice") + " etc... Even if you already have a planet on which you can extract a particular resource, colonizing another planet can be worth since it gives another source of income, perhaps even more powerful.</span><br><br>";
        b += "</div>";
        document.getElementById("profile_info_list") && (document.getElementById("profile_info_list").innerHTML = b);
        $("#here_mining").unbind();
        $("#here_mining").click(function () {
            B("mining", planets[0])
        });
        $("#here_methane").unbind();
        $("#here_methane").click(function () {
            B("prod", planets[0])
        });
        $("#here_other").unbind();
        $("#here_other").click(function () {
            B("other", planets[0])
        });
        $("#here_research").unbind();
        $("#here_research").click(ba);
        currentUpdater = function () {};
        y();
        $("#profile_interface").show()
    })
});

function printShipStats(b) {
    for (var e = "", d = 0; d < b; d++) {
        e += "\n\\" + ships[d].name + "\n";
        for (var h = 0, g = 0; g < ships[d].cost.length; g++) 0 < ships[d].cost[g] && (h += e += resources[g].name + ": power " + ships[d].power / ships[d].cost[g] + ", armor " + ships[d].armor / ships[d].cost[g] + ", hp " + ships[d].hp / ships[d].cost[g] + " mc:" + beauty(ships[d].cost[g] * resourcesPrices[g]) + "\n")
    }
    console.log(e)
}

function speedTab() {
    for (var b = "", e = 0; 16 > e; e++) {
        var d = [1.2, 1.5, 2, 3, 5, 10, 50];
        b += "| " + ships[e].name + " | ";
        for (var h = 0; h < d.length; h++) {
            var g = 4.6 * d[h] / Math.log(ships[e].weight) - 2;
            b += " -" + Math.floor(100 - 50 * (1.1 - 2 * g / (1 + Math.abs(2 * g)) * .9)) + "% | "
        }
        b += "\n"
    }
    console.log(b)
}

function fleetCost(b) {
    for (var e = Array(resNum), d = 0; d < resNum; d++) e[d] = 0;
    for (d = 0; d < resNum; d++)
        for (var h = 0; h < ships.length; h++) e[d] += ships[h].cost[d] * b.ships[h];
    b = "";
    for (d = 0; d < resNum; d++) 0 < e[d] && (b += resources[d].name + ": " + beauty(e[d]) + "\n");
    console.log(b)
}

function basePrices() {
    for (var b = Array(resNum), e = 0; e < resNum; e++) b[e] = 0;
    for (e = 0; e < game.planets.length; e++)
        for (var d = 0; d < resNum; d++) b[d] += planets[game.planets[e]].globalProd[d];
    d = b[0];
    for (e = 0; e < resNum; e++) 0 < b[e] && b[e] > d && (d = b[e]);
    for (e = 0; e < resNum; e++) 0 < b[e] && (b[e] = d / b[e]);
    d = Array(resNum);
    for (e = 0; e < resNum; e++) d[e] = {
        name: resources[e].name,
        price: b[e]
    };
    b = "[";
    for (e = 0; e < resNum - 1; e++) console.log(d[e].name + ": " + d[e].price), b += Math.floor(10 * d[e].price) / 100 + ",";
    b += Math.floor(10 * d[resNum - 1].price) / 100 + "]";
    console.log(b)
}
var plotFleets = function () {
        for (var b = [], e = [], d = [], h = [], g = 0, l = 0; l < planets.length; l++) planets[l].fleets[1] && (b[g] = {
            p: planets[l].fleets[1].power(),
            h: planets[l].fleets[1].hp(),
            a: planets[l].fleets[1].armor()
        }, g++);
        b.sort(function (b, d) {
            return b.p < d.p ? -1 : b.p > d.p ? 1 : 0
        });
        e[0] = 1;
        d[0] = 1;
        for (l = h[0] = 1; l < g; l++) e[l] = b[l].p / b[l - 1].p, d[l] = b[l].h / b[l - 1].h, h[l] = b[l].a / b[l - 1].a;
        b = "power = [";
        for (l = 0; l < g - 1; l++) b += e[l] + ", ";
        b += e[g - 1] + "]; hp = [";
        for (l = 0; l < g - 1; l++) b += d[l] + ", ";
        b += d[g - 1] + "]; armor = [";
        for (l = 0; l < g - 1; l++) b +=
            h[l] + ", ";
        b += h[g - 1] + "];";
        console.log(b)
    },
    prestigeArr = "[";

function ppp(b) {
    game.researches[researchesName.secret].level = 1;
    game.researches[researchesName.secret].bonus();
    game.researchPoint = Math.pow(b, game.timeTravelNum) * tri;
    planets[0].structure[buildingsName.space_machine].number = 1;
    planets[0].structure[buildingsName.time_machine].number = 1;
    for (b = 0; b < nebulas[0].planets.length; b++) game.pushPlanet(nebulas[0].planets[b]);
    prestigeArr += game.techPoints + ","
}

function simb(b, e) {
    document.getElementById("ship_list") && (document.getElementById("ship_list").innerHTML = b.battle(e, "true").r)
}

function viewFleetsStrength(b) {
    for (var e = [], d = 0, h = 0; h < planets.length; h++) planets[h].fleets[1] && (e[d] = {
        n: planets[h].name,
        v: planets[h].fleets[1].value(),
        raw: planets[h].fleets[1].rawValue()
    }, d++);
    for (d = 0; d < e.length - 1; d++) {
        h = d;
        for (var g = d + 1; g < e.length; g++) e[g].v < e[h].v && (h = g);
        g = e[h];
        e[h] = e[d];
        e[d] = g
    }
    if (!b)
        for (console.log(e[0].n + " " + e[0].v), g = 1; g < e.length; g++) console.log(e[g].n + " " + beauty(e[g].v) + " " + Math.pow(1.1, (e[g].v - e[g - 1].v) / 100).toFixed(2) + " " + beauty(e[g].v - e[g - 1].v) + " " + beauty(e[g].raw));
    return e
}

function resetTutorial() {
    for (var b = 0; b < tutorials.length; b++) tutorials[b].done = !1
}

function rankView() {
    for (var b = 0, e = 1, d = viewFleetsStrength(!0), h = 0; 1E4 > h; h++) {
        var g = Math.floor(Math.log(b + 1) / Math.log(2) + 1);
        if (g > e) {
            e = 1E16 * (1 + Math.pow(1.5, b));
            for (var l = "", m = 0; m < d.length; m++) e > d[m].raw && (l = d[m].n + "(x" + beauty(e / d[m].raw) + ")");
            console.log("Rank: " + g + " Points: " + b + " Strength: " + beauty(e) + " - " + l);
            e = g
        }
        b++
    }
}

function extractNames(b, e) {
    for (var d = "{", h = 0; h < b.length; h++) d += '"' + b[h][e].toLowerCase() + '":{\n\t\ten:"' + b[h][e].toLowerCase() + '"\n\t},\n\t';
    return d + "}"
};

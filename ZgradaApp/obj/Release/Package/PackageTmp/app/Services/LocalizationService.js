angularApp.factory('LocalizationService', [function () {

    var myParseFloat = function (decimalComma) {
        if (decimalComma == null || decimalComma == undefined)
            return 0;
        // mozda ovako? v.toLocaleString('en-EN', { minimumFractionDigits: 2 })
        return parseFloat(decimalComma.toString().replace(',', '.'));
    }

    var toHrDecimalCalc = function (decimal) { // ono sto ce biti u inputu - biti ce samo jedan zarez
        if (decimal == null || decimal == undefined)
            return '0,00';

        decimal = parseFloat(decimal).toFixed(2);
        decimal = decimal.toString().replace('.', ',');
        if (decimal.indexOf(',') == -1)
            decimal = decimal + ',00';
        else {
            if (decimal.split(',')[1].length == 1)
                decimal = decimal + '0';
        }
        return decimal;
        //if (decimal.split(",").length - 1 == 0)
        //    decimal += ',00';
        //return parseFloat(decimal.replace(',', '.')).toFixed(2).toString().replace('.', ',');
    }

    var toHrDecimalReadOnly = function (decimal) { // ono sto se ispisuje i ne racuna se s time - 1.234,79
        // decimal je vec fixedto 2
        if (decimal == null || decimal == undefined)
            return "0,00";
        //return decimalComma.toString().replace(',', '.');
        //console.log(decimal.toLocaleString('hr-HR', { minimumFractionDigits: 2 }));
        //decimal = decimal.toString().replace(',', '.'); //za ovo treba tocka
        return parseFloat(decimal).toLocaleString('hr-HR', { minimumFractionDigits: 2 });
    }

    var decimalToEng = function (zgrada, modul) {
        switch (modul) {
            case "prihodiRashodi":
                zgrada.PrihodiRashodi.forEach(function (prGod) {
                    prGod.PrihodiRashodi_Rashodi.forEach(function (rashod) {
                        rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace(',', '.') : 0;
                    })
                    prGod.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                        prihod.Iznos != null ? prihod.Iznos = prihod.Iznos.toString().replace(',', '.') : 0;
                    })
                })
                break;
            case "pricuva":
                zgrada.PricuvaRezijeGodina.forEach(function (prGod) {
                    prGod.PricuvaRezijeGodina_StanjeOd.forEach(function (stanje) {
                        stanje.StanjeOd != null ? stanje.StanjeOd = stanje.StanjeOd.toString().replace(',', '.') : 0;
                    });
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        prMj.ObracunPricuvaCijenaM2 != null ? prMj.ObracunPricuvaCijenaM2 = prMj.ObracunPricuvaCijenaM2.toString().replace(',', '.') : 0;
                        prMj.ObracunPricuvaCijenaUkupno != null ? prMj.ObracunPricuvaCijenaUkupno = prMj.ObracunPricuvaCijenaUkupno.toString().replace(',', '.') : 0;
                        prMj.ObracunRezijeCijenaUkupno != null ? prMj.ObracunRezijeCijenaUkupno = prMj.ObracunRezijeCijenaUkupno.toString().replace(',', '.') : 0;
                        prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova != null ? prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova = prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova.toString().replace(',', '.') : 0;
                        prMj.OrocenaSredstva != null ? prMj.OrocenaSredstva = prMj.OrocenaSredstva.toString().replace(',', '.') : 0;

                        prMj.PricuvaRezijeMjesec_Uplatnice.forEach(function (upl) {
                            upl.UdioPricuva != null ? upl.UdioPricuva = upl.UdioPricuva.toString().replace(',', '.') : 0;
                            upl.UdioRezije != null ? upl.UdioRezije = upl.UdioRezije.toString().replace(',', '.') : 0;
                            upl.IznosRezije != null ? upl.IznosRezije = upl.IznosRezije.toString().replace(',', '.') : 0;
                            upl.IznosPricuva != null ? upl.IznosPricuva = upl.IznosPricuva.toString().replace(',', '.') : 0;
                            upl.JedCijena != null ? upl.JedCijena = upl.JedCijena.toString().replace(',', '.') : 0;
                            upl.Kolicina != null ? upl.Kolicina = upl.Kolicina.toString().replace(',', '.') : 0;
                            upl.Ukupno != null ? upl.Ukupno = upl.Ukupno.toString().replace(',', '.') : 0;
                        });

                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            master.ObracunPricuvaCijenaSlobodanUnos != null ? master.ObracunPricuvaCijenaSlobodanUnos = master.ObracunPricuvaCijenaSlobodanUnos.toString().replace(',', '.') : 0;
                            master.ObracunRezijeCijenaSlobodanUnos != null ? master.ObracunRezijeCijenaSlobodanUnos = master.ObracunRezijeCijenaSlobodanUnos.toString().replace(',', '.') : 0;
                            master.ObracunPricuvaPostoSlobodanUnos != null ? master.ObracunPricuvaPostoSlobodanUnos = master.ObracunPricuvaPostoSlobodanUnos.toString().replace(',', '.') : 0;
                            master.DugPretplata != null ? master.DugPretplata = master.DugPretplata.toString().replace(',', '.') : 0;
                            master.ZaduzenjePricuva != null ? master.ZaduzenjePricuva = master.ZaduzenjePricuva.toString().replace(',', '.') : 0;
                            master.ZaduzenjeRezije != null ? master.ZaduzenjeRezije = master.ZaduzenjeRezije.toString().replace(',', '.') : 0;
                            master.Uplaceno != null ? master.Uplaceno = master.Uplaceno.toString().replace(',', '.') : 0;
                            master.PocetnoStanje != null ? master.PocetnoStanje = master.PocetnoStanje.toString().replace(',', '.') : 0;
                            master.StanjeOd != null ? master.StanjeOd = master.StanjeOd.toString().replace(',', '.') : 0;
                        });
                    });
                });
                break;
            case "uplatniceRacuniOnly":
                // zgrada je list uplatnica/racuna
                zgrada.forEach(function (upl) {
                    upl.UdioPricuva != null ? upl.UdioPricuva = upl.UdioPricuva.toString().replace(',', '.') : 0;
                    upl.UdioRezije != null ? upl.UdioRezije = upl.UdioRezije.toString().replace(',', '.') : 0;
                    upl.IznosRezije != null ? upl.IznosRezije = upl.IznosRezije.toString().replace(',', '.') : 0;
                    upl.IznosPricuva != null ? upl.IznosPricuva = upl.IznosPricuva.toString().replace(',', '.') : 0;
                    upl.JedCijena != null ? upl.JedCijena = upl.JedCijena.toString().replace(',', '.') : 0;
                    upl.Kolicina != null ? upl.Kolicina = upl.Kolicina.toString().replace(',', '.') : 0;
                    upl.Ukupno != null ? upl.Ukupno = upl.Ukupno.toString().replace(',', '.') : 0;
                });
                break;
            case "ZgradaStanovi":
                // zgrada je pdMaster
                zgrada.Zgrade_PosebniDijeloviMaster_Povrsine.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace(',', '.') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace(',', '.') : 0;
                });
                zgrada.Zgrade_PosebniDijeloviMaster_Pripadci.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace(',', '.') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace(',', '.') : 0;
                });
        }
        // prihodi rashodi


        return zgrada;
    }

    var decimalToHr = function (zgrada, modul) {
        //console.log(zgrada);
        // prihodi rashodi
        //zgrada.PrihodiRashodi.forEach(function (prGod) {
        //    prGod.PrihodiRashodi_Rashodi.forEach(function (rashod) {
        //        rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace('.', ',') : 0;
        //        console.log(rashod.Iznos);
        //    })
        //})
        switch (modul) {
            case "prihodiRashodi":
                zgrada.PrihodiRashodi.forEach(function (prGod) {
                    prGod.PrihodiRashodi_Rashodi.forEach(function (rashod) {
                        //rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace('.', ',') : 0;
                        rashod.Iznos = toHrDecimalCalc(rashod.Iznos);
                    })
                    prGod.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                        //prihod.Iznos != null ? prihod.Iznos = prihod.Iznos.toString().replace('.', ',') : 0;
                        prihod.Iznos = toHrDecimalCalc(prihod.Iznos);
                    })
                })
                break;
            case "pricuva":
                zgrada.PricuvaRezijeGodina.forEach(function (prGod) {
                    prGod.PricuvaRezijeGodina_StanjeOd.forEach(function (stanje) {
                        //stanje.StanjeOd != null ? stanje.StanjeOd = stanje.StanjeOd.toString().replace('.', ',') : 0;
                        stanje.StanjeOd = toHrDecimalCalc(stanje.StanjeOd);
                    });
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        //prMj.ObracunPricuvaCijenaM2 != null ? prMj.ObracunPricuvaCijenaM2 = prMj.ObracunPricuvaCijenaM2.toString().replace('.', ',') : 0;
                        prMj.ObracunPricuvaCijenaM2 = toHrDecimalCalc(prMj.ObracunPricuvaCijenaM2);
                        //prMj.ObracunPricuvaCijenaUkupno != null ? prMj.ObracunPricuvaCijenaUkupno = prMj.ObracunPricuvaCijenaUkupno.toString().replace('.', ',') : 0;
                        prMj.ObracunPricuvaCijenaUkupno = toHrDecimalCalc(prMj.ObracunPricuvaCijenaUkupno);
                        //prMj.ObracunRezijeCijenaUkupno != null ? prMj.ObracunRezijeCijenaUkupno = prMj.ObracunRezijeCijenaUkupno.toString().replace('.', ',') : 0;
                        prMj.ObracunRezijeCijenaUkupno = toHrDecimalCalc(prMj.ObracunRezijeCijenaUkupno);
                        //prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova != null ? prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova = prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova.toString().replace('.', ',') : 0;
                        prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova = toHrDecimalCalc(prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova);
                        //prMj.OrocenaSredstva != null ? prMj.OrocenaSredstva = prMj.OrocenaSredstva.toString().replace('.', ',') : 0;
                        prMj.OrocenaSredstva = toHrDecimalCalc(prMj.OrocenaSredstva);

                        prMj.PricuvaRezijeMjesec_Uplatnice.forEach(function (upl) {
                            upl.UdioPricuva = toHrDecimalCalc(upl.UdioPricuva);
                            upl.UdioRezije = toHrDecimalCalc(upl.UdioRezije);
                            upl.IznosRezije = toHrDecimalCalc(upl.IznosRezije);
                            upl.IznosPricuva = toHrDecimalCalc(upl.IznosPricuva);
                            upl.JedCijena = toHrDecimalCalc(upl.JedCijena);
                            upl.Kolicina = toHrDecimalCalc(upl.Kolicina);
                            upl.Ukupno = toHrDecimalCalc(upl.Ukupno);
                            upl.UplatnicaZaPlatiti = toHrDecimalCalc(upl.UplatnicaZaPlatiti);
                            
                        });

                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            //master.ObracunPricuvaCijenaSlobodanUnos != null ? master.ObracunPricuvaCijenaSlobodanUnos = master.ObracunPricuvaCijenaSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunPricuvaCijenaSlobodanUnos = toHrDecimalCalc(master.ObracunPricuvaCijenaSlobodanUnos);
                            //master.ObracunRezijeCijenaSlobodanUnos != null ? master.ObracunRezijeCijenaSlobodanUnos = master.ObracunRezijeCijenaSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunRezijeCijenaSlobodanUnos = toHrDecimalCalc(master.ObracunRezijeCijenaSlobodanUnos);
                            //master.ObracunPricuvaPostoSlobodanUnos != null ? master.ObracunPricuvaPostoSlobodanUnos = master.ObracunPricuvaPostoSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunPricuvaPostoSlobodanUnos = toHrDecimalCalc(master.ObracunPricuvaPostoSlobodanUnos);
                            //master.DugPretplata != null ? master.DugPretplata = parseFloat(master.DugPretplata).toString().replace('.', ',') : 0;
                            master.DugPretplata = toHrDecimalCalc(master.DugPretplata);
                            master.Dug = toHrDecimalCalc(master.Dug);
                            //master.ZaduzenjePricuva != null ? master.ZaduzenjePricuva = parseFloat(master.ZaduzenjePricuva).toString().replace('.', ',') : 0;
                            master.ZaduzenjePricuva = toHrDecimalCalc(master.ZaduzenjePricuva);
                            //master.ZaduzenjeRezije != null ? master.ZaduzenjeRezije = parseFloat(master.ZaduzenjeRezije).toString().replace('.', ',') : 0;
                            master.ZaduzenjeRezije = toHrDecimalCalc(master.ZaduzenjeRezije);
                            //master.Uplaceno != null ? master.Uplaceno = parseFloat(master.Uplaceno).toString().replace('.', ',') : 0;
                            master.Uplaceno = toHrDecimalCalc(master.Uplaceno);
                            //master.PocetnoStanje != null ? master.PocetnoStanje = master.PocetnoStanje.toString().replace('.', ',') : 0;
                            master.PocetnoStanje = toHrDecimalCalc(master.PocetnoStanje);
                            //master.StanjeOd != null ? master.StanjeOd = parseFloat(master.StanjeOd).toString().replace('.', ',') : 0;
                            master.StanjeOd = toHrDecimalCalc(master.StanjeOd);
                        });
                    });
                });
                break;
            case "uplatniceRacuniOnly":
                // zgrada je list uplatnica/racuna
                zgrada.forEach(function (upl) {
                    upl.UdioPricuva = toHrDecimalCalc(upl.UdioPricuva);
                    upl.UdioRezije = toHrDecimalCalc(upl.UdioRezije);
                    upl.IznosRezije = toHrDecimalCalc(upl.IznosRezije);
                    upl.IznosPricuva = toHrDecimalCalc(upl.IznosPricuva);
                    upl.JedCijena = toHrDecimalCalc(upl.JedCijena);
                    upl.Kolicina = toHrDecimalCalc(upl.Kolicina);
                    upl.Ukupno = toHrDecimalCalc(upl.Ukupno);
                    upl.UplatnicaZaPlatiti = toHrDecimalCalc(upl.UplatnicaZaPlatiti);
                });
                break;
            case "ZgradaStanovi":
                // zgrada je pdMaster
                zgrada.Zgrade_PosebniDijeloviMaster_Povrsine.forEach(function (p) {
                    p.Povrsina = toHrDecimalCalc(p.Povrsina);
                    p.Koef = toHrDecimalCalc(p.Koef);
                    //p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace('.', ',') : 0;
                    //p.Koef != null ? p.Koef = p.Koef.toString().replace('.', ',') : 0;
                });
                zgrada.Zgrade_PosebniDijeloviMaster_Pripadci.forEach(function (p) {
                    p.Povrsina = toHrDecimalCalc(p.Povrsina);
                    p.Koef = toHrDecimalCalc(p.Koef);
                });
                break;
            case "pricuvaGodTable":
                // zgrada je ovdje array
                var index = 0;
                zgrada.forEach(function (row) {
                    if (row.Dug != null) 
                        row.Dug = toHrDecimalReadOnly(row.Dug);
                    if (row.ZaduzenjePricuva != null) 
                        row.ZaduzenjePricuva = toHrDecimalReadOnly(row.ZaduzenjePricuva);
                    if (row.ZaduzenjeRezije != null) 
                        row.ZaduzenjeRezije = toHrDecimalReadOnly(row.ZaduzenjeRezije);
                    if (row.Uplaceno != null) 
                        row.Uplaceno = toHrDecimalReadOnly(row.Uplaceno);
                    if (row.StanjeOd != null) 
                        row.StanjeOd = toHrDecimalReadOnly(row.StanjeOd);

                    // mjeseci
                    if (row.Mj1 != null) 
                        row.Mj1 = toHrDecimalReadOnly(row.Mj1);
                    if (row.Mj2 != null) 
                        row.Mj2 = toHrDecimalReadOnly(row.Mj2);
                    if (row.Mj3 != null) 
                        row.Mj3 = toHrDecimalReadOnly(row.Mj3);
                    if (row.Mj4 != null) 
                        row.Mj4 = toHrDecimalReadOnly(row.Mj4);
                    if (row.Mj5 != null) 
                        row.Mj5 = toHrDecimalReadOnly(row.Mj5);
                    if (row.Mj6 != null) 
                        row.Mj6 = toHrDecimalReadOnly(row.Mj6);
                    if (row.Mj7 != null) 
                        row.Mj7 = toHrDecimalReadOnly(row.Mj7);
                    if (row.Mj8 != null) 
                        row.Mj8 = toHrDecimalReadOnly(row.Mj8);
                    if (row.Mj9 != null) 
                        row.Mj9 = toHrDecimalReadOnly(row.Mj9);
                    if (row.Mj10 != null) 
                        row.Mj10 = toHrDecimalReadOnly(row.Mj10);
                    if (row.Mj11 != null) 
                        row.Mj11 = toHrDecimalReadOnly(row.Mj11);
                    if (row.Mj12 != null) 
                        row.Mj12 = toHrDecimalReadOnly(row.Mj12);
                    index = 0;
                    row.SaldoMj1.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            //s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj1[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj2.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            //s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj2[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj3.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            //s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj3[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj4.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj4[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj5.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj5[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj6.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj6[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj7.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj7[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj8.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj8[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj9.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj9[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj10.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj10[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj11.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj11[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj12.forEach(function (s) {
                        if (s != null) {
                            s = toHrDecimalReadOnly(s);
                            row.SaldoMj12[index] = s;
                        }
                        index++;
                    });
                });
                break;
        }
        //console.log(zgrada);
        return zgrada;
    }

    return {
        decimalToEng: decimalToEng,
        decimalToHr: decimalToHr,
        myParseFloat: myParseFloat,
        //toHrDecimalCalc: toHrDecimalCalc, => toHrDecimalCalc
        //toHrDecimalReadOnly: toHrDecimalReadOnly => toHrDecimalReadOnly
        toHrDecimalCalc: toHrDecimalCalc,
        toHrDecimalReadOnly: toHrDecimalReadOnly
    }

}]);
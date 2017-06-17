angularApp.factory('LocalizationService', [function () {

    var myParseFloat = function (decimalComma) {
        if (decimalComma == null || decimalComma == undefined)
            return 0;
        // mozda ovako? v.toLocaleString('en-EN', { minimumFractionDigits: 2 })
        return parseFloat(decimalComma.toString().replace(',', '.'));
    }

    var toHrDecimalView = function (decimal) {
        if (decimal == null || decimal == undefined)
            return '0,00';

        decimal = decimal.toString();

        if (decimal.split(",").length - 1 == 0)
            decimal += ',00';
        return parseFloat(decimal.replace(',', '.')).toFixed(2).toString().replace('.', ',');
    }

    var toHrDecimal = function (decimal) {
        // decimal je vec fixedto 2
        if (decimal == null || decimal == undefined)
            return 0;
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
        console.log(zgrada);
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
                        rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace('.', ',') : 0;
                    })
                    prGod.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                        prihod.Iznos != null ? prihod.Iznos = prihod.Iznos.toString().replace('.', ',') : 0;
                    })
                })
                break;
            case "pricuva":
                zgrada.PricuvaRezijeGodina.forEach(function (prGod) {
                    prGod.PricuvaRezijeGodina_StanjeOd.forEach(function (stanje) {
                        stanje.StanjeOd != null ? stanje.StanjeOd = stanje.StanjeOd.toString().replace('.', ',') : 0;
                    });
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        prMj.ObracunPricuvaCijenaM2 != null ? prMj.ObracunPricuvaCijenaM2 = prMj.ObracunPricuvaCijenaM2.toString().replace('.', ',') : 0;
                        prMj.ObracunPricuvaCijenaUkupno != null ? prMj.ObracunPricuvaCijenaUkupno = prMj.ObracunPricuvaCijenaUkupno.toString().replace('.', ',') : 0;
                        prMj.ObracunRezijeCijenaUkupno != null ? prMj.ObracunRezijeCijenaUkupno = prMj.ObracunRezijeCijenaUkupno.toString().replace('.', ',') : 0;
                        prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova != null ? prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova = prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova.toString().replace('.', ',') : 0;
                        prMj.OrocenaSredstva != null ? prMj.OrocenaSredstva = prMj.OrocenaSredstva.toString().replace('.', ',') : 0;

                        prMj.PricuvaRezijeMjesec_Uplatnice.forEach(function (upl) {
                            upl.UdioPricuva != null ? upl.UdioPricuva = upl.UdioPricuva.toString().replace('.', ',') : 0;
                            upl.UdioRezije != null ? upl.UdioRezije = upl.UdioRezije.toString().replace('.', ',') : 0;
                            upl.IznosRezije != null ? upl.IznosRezije = upl.IznosRezije.toString().replace('.', ',') : 0;
                            upl.IznosPricuva != null ? upl.IznosPricuva = upl.IznosPricuva.toString().replace('.', ',') : 0;
                        });

                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            master.ObracunPricuvaCijenaSlobodanUnos != null ? master.ObracunPricuvaCijenaSlobodanUnos = master.ObracunPricuvaCijenaSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunRezijeCijenaSlobodanUnos != null ? master.ObracunRezijeCijenaSlobodanUnos = master.ObracunRezijeCijenaSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunPricuvaPostoSlobodanUnos != null ? master.ObracunPricuvaPostoSlobodanUnos = master.ObracunPricuvaPostoSlobodanUnos.toString().replace('.', ',') : 0;
                            //master.DugPretplata != null ? master.DugPretplata = master.DugPretplata.toString().replace('.', ',') : 0;
                            master.DugPretplata != null ? master.DugPretplata = parseFloat(master.DugPretplata).toString().replace('.', ',') : 0;
                            //alert(master.DugPretplata);
                            //master.ZaduzenjePricuva != null ? master.ZaduzenjePricuva = master.ZaduzenjePricuva.toString().replace('.', ',') : 0;
                            master.ZaduzenjePricuva != null ? master.ZaduzenjePricuva = parseFloat(master.ZaduzenjePricuva).toString().replace('.', ',') : 0;
                            //master.ZaduzenjeRezije != null ? master.ZaduzenjeRezije = master.ZaduzenjeRezije.toString().replace('.', ',') : 0;
                            master.ZaduzenjeRezije != null ? master.ZaduzenjeRezije = parseFloat(master.ZaduzenjeRezije).toString().replace('.', ',') : 0;
                            //master.Uplaceno != null ? master.Uplaceno = master.Uplaceno.toString().replace('.', ',') : 0;
                            master.Uplaceno != null ? master.Uplaceno = parseFloat(master.Uplaceno).toString().replace('.', ',') : 0;
                            master.PocetnoStanje != null ? master.PocetnoStanje = master.PocetnoStanje.toString().replace('.', ',') : 0;
                            master.StanjeOd != null ? master.StanjeOd = parseFloat(master.StanjeOd).toString().replace('.', ',') : 0;
                            //master.StanjeOd != null ? master.StanjeOd = master.StanjeOd.toString().replace('.', ',') : 0;
                        });
                    });
                });
                break;
            case "ZgradaStanovi":
                // zgrada je pdMaster
                zgrada.Zgrade_PosebniDijeloviMaster_Povrsine.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace('.', ',') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace('.', ',') : 0;
                });
                zgrada.Zgrade_PosebniDijeloviMaster_Pripadci.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace('.', ',') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace('.', ',') : 0;
                });
                break;
            case "pricuvaGodTable":
                // zgrada je ovdje array
                var index = 0;
                zgrada.forEach(function (row) {
                    if (row.Dug != null) {
                        //if (row.Dug.toString().indexOf('.') == -1)
                        //    row.Dug = row.Dug.toString() + ',00';
                        //else
                        //    row.Dug = row.Dug.toString().replace('.', ',');
                        row.Dug = row.Dug.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.ZaduzenjePricuva != null) {
                        //if (row.ZaduzenjePricuva.toString().indexOf('.') == -1)
                        //    row.ZaduzenjePricuva = row.ZaduzenjePricuva.toString() + ',00';
                        //else
                        //    row.ZaduzenjePricuva = row.ZaduzenjePricuva.toString().replace('.', ',');
                        row.ZaduzenjePricuva = row.ZaduzenjePricuva.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.ZaduzenjeRezije != null) {
                        //if (row.ZaduzenjeRezije.toString().indexOf('.') == -1)
                        //    row.ZaduzenjeRezije = row.ZaduzenjeRezije.toString() + ',00';
                        //else
                        //    row.ZaduzenjeRezije = row.ZaduzenjeRezije.toString().replace('.', ',');
                        row.ZaduzenjeRezije = row.ZaduzenjeRezije.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Uplaceno != null) {
                        //if (row.Uplaceno.toString().indexOf('.') == -1)
                        //    row.Uplaceno = row.Uplaceno.toString() + ',00';
                        //else
                        //    row.Uplaceno = row.Uplaceno.toString().replace('.', ',');
                        row.Uplaceno = row.Uplaceno.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.StanjeOd != null) {
                        //if (row.StanjeOd.toString().indexOf('.') == -1)
                        //    row.StanjeOd = row.StanjeOd.toString() + ',00';
                        //else
                        //    row.StanjeOd = row.StanjeOd.toString().replace('.', ',');
                        row.StanjeOd = row.StanjeOd.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }

                    // mjeseci
                    if (row.Mj1 != null) {
                        //if (row.Mj1.toString().indexOf('.') == -1)
                        //    row.Mj1 = row.Mj1.toString() + ',00';
                        //else
                        //    row.Mj1 = row.Mj1.toString().replace('.', ',');
                        row.Mj1 = row.Mj1.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj2 != null) {
                        //if (row.Mj2.toString().indexOf('.') == -1)
                        //    row.Mj2 = row.Mj2.toString() + ',00';
                        //else
                        //    row.Mj2 = row.Mj2.toString().replace('.', ',');
                        row.Mj2 = row.Mj2.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj3 != null) {
                        //if (row.Mj3.toString().indexOf('.') == -1)
                        //    row.Mj3 = row.Mj3.toString() + ',00';
                        //else
                        //    row.Mj3 = row.Mj3.toString().replace('.', ',');
                        row.Mj3 = row.Mj3.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj4 != null) {
                        //if (row.Mj4.toString().indexOf('.') == -1)
                        //    row.Mj4 = row.Mj4.toString() + ',00';
                        //else
                        //    row.Mj4 = row.Mj4.toString().replace('.', ',');
                        row.Mj4 = row.Mj4.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj5 != null) {
                        //if (row.Mj5.toString().indexOf('.') == -1)
                        //    row.Mj5 = row.Mj5.toString() + ',00';
                        //else
                        //    row.Mj5 = row.Mj5.toString().replace('.', ',');
                        row.Mj5 = row.Mj5.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj6 != null) {
                        //if (row.Mj6.toString().indexOf('.') == -1)
                        //    row.Mj6 = row.Mj6.toString() + ',00';
                        //else
                        //    row.Mj6 = row.Mj6.toString().replace('.', ',');
                        row.Mj6 = row.Mj6.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj7 != null) {
                        if (row.Mj7.toString().indexOf('.') == -1)
                            row.Mj7 = row.Mj7.toString() + ',00';
                        else
                            row.Mj7 = row.Mj7.toString().replace('.', ',');
                        row.Mj7 = row.Mj7.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj8 != null) {
                        //if (row.Mj8.toString().indexOf('.') == -1)
                        //    row.Mj8 = row.Mj8.toString() + ',00';
                        //else
                        //    row.Mj8 = row.Mj8.toString().replace('.', ',');
                        row.Mj8 = row.Mj8.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj9 != null) {
                        //if (row.Mj9.toString().indexOf('.') == -1)
                        //    row.Mj9 = row.Mj9.toString() + ',00';
                        //else
                        //    row.Mj9 = row.Mj9.toString().replace('.', ',');
                        row.Mj9 = row.Mj9.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj10 != null) {
                        //if (row.Mj10.toString().indexOf('.') == -1)
                        //    row.Mj10 = row.Mj10.toString() + ',00';
                        //else
                        //    row.Mj10 = row.Mj10.toString().replace('.', ',');
                        row.Mj10 = row.Mj10.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj11 != null) {
                        //if (row.Mj11.toString().indexOf('.') == -1)
                        //    row.Mj11 = row.Mj11.toString() + ',00';
                        //else
                        //    row.Mj11 = row.Mj11.toString().replace('.', ',');
                        row.Mj11 = row.Mj11.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    if (row.Mj12 != null) {
                        //if (row.Mj12.toString().indexOf('.') == -1)
                        //    row.Mj12 = row.Mj12.toString() + ',00';
                        //else
                        //    row.Mj12 = row.Mj12.toString().replace('.', ',');
                        row.Mj12 = row.Mj12.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                    }
                    index = 0;
                    row.SaldoMj1.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj1[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj2.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj2[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj3.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj3[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj4.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj4[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj5.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj5[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj6.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj6[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj7.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj7[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj8.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj8[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj9.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj9[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj10.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj10[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj11.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj11[index] = s;
                        }
                        index++;
                    });
                    index = 0;
                    row.SaldoMj12.forEach(function (s) {
                        if (s != null) {
                            //if (s.toString().indexOf('.') == -1)
                            //    s = s.toString() + ',00';
                            //else
                            //    s = s.toString().replace('.', ',');
                            s = s.toLocaleString('hr-HR', { minimumFractionDigits: 2 })
                            row.SaldoMj12[index] = s;
                        }
                        index++;
                    });
                });
                break;
        }
        console.log(zgrada);
        return zgrada;
    }

    return {
        decimalToEng: decimalToEng,
        decimalToHr: decimalToHr,
        myParseFloat: myParseFloat,
        toHrDecimal: toHrDecimal,
        toHrDecimalView: toHrDecimalView
    }

}]);
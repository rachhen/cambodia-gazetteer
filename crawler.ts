import fs from "fs/promises";
import axios from "axios";
import * as cheerio from "cheerio";
import { Commune, District, Province, Village } from "./crawler.interface";

const siteUrl = "http://db.ncdd.gov.kh/gazetteer/view";

const main = async () => {
  const provinces = await loadProvinces();
  // console.log(provinces);
  saveData({ provinces });
  const districts = await loadDistricts(provinces);
  // console.log(districts);
  saveData({ provinces, districts });
  const communes = await loadCommunes(districts);
  // console.log(communes);
  saveData({ provinces, districts, communes });
  const villages = await loadVillages(communes);

  saveData({ provinces, districts, communes, villages });
};
main();

const saveData = (data: any) => {
  fs.writeFile("crawler.json", JSON.stringify(data, null, 2))
    .then(() => console.log("write done!"))
    .catch(console.log);
};

async function loadProvinces(): Promise<Province[]> {
  const keys = [
    "id",
    "code",
    "khmer",
    "latin",
    "krong",
    "srok",
    "khan",
    "commune",
    "sangkat",
    "village",
    "reference",
  ];
  console.log(`-----Processing Provinces-----`);
  const { data } = await axios.get(siteUrl + "/index.castle");
  const $ = cheerio.load(data);
  const provinces: Province[] = [];

  const proEl = $("#content > table tr[id^=row_pv]");
  proEl.each(function (parentIdx, parentEle) {
    let keyIdx = 0;
    const obj: any = {};

    $(parentEle)
      .children()
      .each(function (childIdx, childEle) {
        const tdValue = $(childEle).text();
        obj[keys[keyIdx]] = tdValue;
        keyIdx++;
      });

    provinces.push(obj);
  });
  console.log(`-----Got ${provinces.length} Provinces-----`);
  return provinces;
}

const loadDistricts = async (provinces: Province[]): Promise<District[]> => {
  const keys = [
    "id",
    "code",
    "khmer",
    "latin",
    "commune",
    "sangkat",
    "village",
    "reference",
  ];
  const districts: District[] = [];
  for (let index = 0; index < provinces.length; index++) {
    const province = provinces[index];
    console.log(`-----Processing province (${province.latin})-----`);
    try {
      const formData = new URLSearchParams();
      formData.append("pv", province.code);
      const { data } = await axios.post(
        siteUrl + "/province.castle",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const $ = cheerio.load(data);

      $("#dl_list > table tr[id^=row_ds]").each(function (
        parentIdx,
        parentEle
      ) {
        let keyIdx = 0;
        const obj: any = {};

        $(parentEle)
          .children()
          .each(function (childIdx, childEle) {
            const tdValue = $(childEle).text();
            obj[keys[keyIdx]] = tdValue;
            keyIdx++;
          });

        districts.push({ ...obj, province_code: province.code });
      });

      console.log(`-----Finished province (${province.latin})-----`);
      console.log(`-----delay 5s-----`);
      await delay(5000);
    } catch (err) {
      console.log(`error province ${province.latin}`, err);
    }
  }
  return districts;
};

const loadCommunes = async (districts: District[]): Promise<Commune[]> => {
  const communes: Commune[] = [];
  const keys = ["id", "code", "khmer", "latin", "village", "reference"];

  for (let index = 0; index < districts.length; index++) {
    const district = districts[index];
    console.log(`-----Processing Commune (${district.latin})-----`);
    try {
      const formData = new URLSearchParams();
      formData.append("ds", district.code);
      const { data } = await axios.post(
        siteUrl + "/district.castle",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const $ = cheerio.load(data);

      $("#dl_list > table tr[id^=row_cm]").each(function (
        parentIdx,
        parentEle
      ) {
        let keyIdx = 0;
        const obj: any = {};

        $(parentEle)
          .children()
          .each(function (childIdx, childEle) {
            const tdValue = $(childEle).text();
            obj[keys[keyIdx]] = tdValue;
            keyIdx++;
          });

        communes.push({ ...obj, district_code: district.code });
      });
      console.log(`-----Finished Commune (${district.latin})-----`);
      console.log(`-----delay 5s-----`);
      await delay(5000);
    } catch (error) {
      console.log(`error province ${district.latin}`, error);
    }
  }
  return communes;
};

const loadVillages = async (communes: Commune[]): Promise<Village[]> => {
  const keys = ["id", "code", "khmer", "latin", "reference", "note"];

  const villages: Village[] = [];
  for (let index = 0; index < communes.length; index++) {
    const commune = communes[index];
    console.log(`-----Processing village (${commune.latin})-----`);
    try {
      const formData = new URLSearchParams();
      formData.append("cm", commune.code);
      const { data } = await axios.post(siteUrl + "/commune.castle", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const $ = cheerio.load(data);

      $("#dl_list > table tr[id^=row_vil]").each(function (
        parentIdx,
        parentEle
      ) {
        let keyIdx = 0;
        const obj: any = {};

        $(parentEle)
          .children()
          .each(function (childIdx, childEle) {
            const tdValue = $(childEle).text();
            obj[keys[keyIdx]] = tdValue;
            keyIdx++;
          });

        villages.push({ ...obj, commune_code: commune.code });
      });
      console.log(`-----Finished village (${commune.latin})-----`);
      console.log(`-----delay 5s-----`);
      await delay(5000);
    } catch (error) {
      console.log(`error province ${commune.latin}`, error);
    }
  }
  return villages;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

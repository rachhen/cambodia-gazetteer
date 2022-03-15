import data from "./cambodia_gazetteer.json";
import fs from "fs/promises";

const provinces = [];
const districts = [];
const communes = [];
const villages = [];
for (let p = 0; p < data.length; p++) {
  const { boundary, districts: dists, ...province } = data[p];
  const { boundary: _, ...restBoundary } = boundary;
  provinces.push({
    id: p + 1,
    ...province,
    boundary: restBoundary,
  });

  for (let d = 0; d < dists.length; d++) {
    const { communes: coms, ...district } = dists[d];
    districts.push({
      id: d + 1,
      province_id: p + 1,
      ...district,
    });

    for (let c = 0; c < coms.length; c++) {
      const { villages: vi, ...commune } = coms[c];
      communes.push({ id: c + 1, district_id: d + 1, ...commune });

      for (let v = 0; v < vi.length; v++) {
        villages.push({ id: v + 1, commune_id: c + 1, ...vi[v] });
      }
    }
  }
}

const obj = { provinces, districts, communes, villages };
fs.writeFile("db.json", JSON.stringify(obj, null, 2))
  .then(() => console.log("done!"))
  .catch((err) => console.log(err));

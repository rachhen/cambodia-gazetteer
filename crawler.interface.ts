export interface Province {
  id: string;
  code: string;
  khmer: string;
  latin: string;
  krong: string;
  srok: string;
  khan: string;
  commune: string;
  sangkat: string;
  Village: string;
  reference: string;
}

export interface District {
  id: string;
  code: string;
  province_code: string;
  khmer: string;
  latin: string;
  commune: string;
  sangkat: string;
  village: string;
  reference: string;
}

export interface Commune {
  id: string;
  code: string;
  district_code: string;
  khmer: string;
  latin: string;
  village: string;
  reference: string;
}

export interface Village {
  id: string;
  code: string;
  commune_code: string;
  khmer: string;
  latin: string;
  reference: string;
  note: string;
}

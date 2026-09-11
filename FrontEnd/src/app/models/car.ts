export interface Brand {
  id: number;
  name: string;
  logos: string[];
}

export interface Car {
  id: number;
  model: string;
  year: string;
  carto: Carto[];
}

export interface Carto {
  id: number;
  name: string;
  outil?: string;
  version?: string;
  creationDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  updateDate: Date;
  families: any[];
}


export interface Family {
  id: string;
  name: string;
  ecus: Ecu[];
  expanded?: boolean;
}

export interface Ecu {
  id: string;
  name: string;
  reco: string;
  perimetre : string;
  mpm: string;
  ident: string;
  ta: string;
  fa: string;
  protocol: string;
  sa: string;
  respDev: string;
  etatDev: string;
  expanded?: boolean;
}
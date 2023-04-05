export type PermsValueType = {name:string,description:string,module:string};
export type PermsType = {[key: string]:PermsValueType};
export type PermsModuleType = {[PermsModule : string] : PermsType}

export const PERMS_KEY = 'perms';
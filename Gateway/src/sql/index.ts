import { isArray } from "util";

export default class SQL {
    public where: string[] = [];
    public params: any;
    public values: string[];
    public returnFields: (new (any: any) => any)[];
    public cmd: string;
    public before: (sql: SQL, where: any, params: any, values: any) => SQL;
    constructor(params: any) {
        if (params != null) {
            let keys = Object.keys(params);
            for (let key of keys) {
                if (params[key] !== undefined) {
                    this[key] = params[key];
                }
            }
        }
    }
    /**通用统计数据 */
    public static get CommonData(): SQL {
        return new SQL({
            where: ["table"],
            returnFields: [String, Number],
            params: { fields: ["table", "count"], table: "common", limit: 10, offset: 0, },
            cmd: "SELECT {fields} FROM {table}",
            before: (sql: SQL, where: any, params: any, values: any) => {
                Where(sql, where);
                PageLimit(sql, params);
                return sql;
            }
        });
    }
    public static get UserDataPaging(): SQL {
        return new SQL({
            params: { fields: ["id", "name", "tel", "community", "room"], limit: 10, offset: 0, table: "public.user" },
            returnFields: [Number, String, String, String, String],
            cmd: "SELECT {fields} FROM {table} LIMIT {limit} OFFSET {offset}",
            before: (sql: SQL, params: any, values: any) => {
                //console.log("[预处理测试]");
                return sql;
            }
        });
    }
    /**查询社区数据 */
    public static get CommunityData(): SQL {
        return new SQL({
            where: ["id", "uuid", "name"],
            params: { fields: ["id", "uuid", "name", "block"], table: "community", limit: 10, offset: 0 },
            returnFields: [Number, String, String, Array],
            cmd: "SELECT {fields} FROM {table}",
            before: (sql: SQL, where: any, params: any, values: any) => {
                Where(sql, where);
                PageLimit(sql, params);
                return sql;
            }
        })
    }
    public static get BlockData(): SQL {
        return new SQL({
            where: ["id", "uuid", "name", "community_id", "community_name"],
            params: { fields: ["id", "uuid", "name", "community_id", "community_name"], table: "block", limit: 10, offset: 0 },
            returnFields: [Number, String, String, Number, String],
            cmd: "SELECT {fields} FROM {table}",
            before: (sql: SQL, where: any, params: any, values: any) => {
                Where(sql, where);
                PageLimit(sql, params);
                return sql;
            }
        })
    }
    public static get RoomData(): SQL {
        return new SQL({
            where: ["id", "uuid", "name","host_name", "host", "floor", "block_id", "block_name", "community_id", "community_name"],
            params: { fields: ["id", "uuid", "name", "host","host_name", "floor", "doorplate", "block_id", "block_name", "community_id", "community_name", "tel"], table: "room", limit: 10, offset: 0 },
            returnFields: [Number, String, String, String,String, Number, Number, Number, String, Number, String, String],
            cmd: "SELECT {fields} FROM {table}",
            before: (sql: SQL, where: any, params: any, values: any) => {
                Where(sql, where);
                PageLimit(sql, params);
                return sql;
            }
        })
    }

    public static get SubmitData(): SQL {
        return new SQL({
            values: ["name", "host","host_name", "floor", "doorplate", "block_id", "block_name", "community_id", "community_name", "tel"],
            where: ["id", "uuid", "tel", "host"],
            params: { table: "room" },
            cmd: "UPDATE {table}",
            before: (sql: SQL, where: any, params: any, values: any) => {
                Values(sql, values)
                Where(sql, where);
                return sql;
            }
        })
    }
}
function Values(sql: SQL, values: any) {
    if (values == null) return;
    let valuesLimit = sql.values;
    let fields = Object.keys(values);
    if (!fields || !fields.length) return;
    let conditionStr = " SET"
    for (let field of fields) {
        if (valuesLimit && valuesLimit.length && valuesLimit.indexOf(field) == -1) continue;
        if (values[field] != null) {
            conditionStr += ' "' + field + '"' + " = " + Replace(values[field]) + "";
            sql.cmd += conditionStr;
            //名称限定连接
            conditionStr = " ,"
        };
    }
}
/**字段限制 */
function Where(sql: SQL, where: any) {
    if (where == null) return;
    //可用限制值
    let whereLimit = sql.where;
    let fields = Object.keys(where);
    if (!fields || !fields.length) return;
    let conditionStr = " WHERE";
    for (let field of fields) {
        if (whereLimit && whereLimit.length && whereLimit.indexOf(field) == -1) continue;
        if (where[field] != null) {
            conditionStr += ' "' + field + '"' + " in (" + Replace(where[field]) + ")";
            sql.cmd += conditionStr;
            //名称限定连接
            conditionStr = " AND"
        };
    }
}
/**分页限制 */
function PageLimit(sql: SQL, params: any) {
    if (params == null) return;
    if (params.limit != null) {
        sql.cmd += " LIMIT {limit}";
    }
    if (params.offset != null) {
        sql.cmd += " OFFSET {offset}"
    }
}

function Replace(value, onReplace = (value: any) => {
    if (typeof value == "string") {
        if(value === "null")return "null";
        return "'" + value + "'";
    }
    return value;
}) {
    let str = "";
    if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            str += onReplace(value[i]);
            if (i < value.length - 1) {
                str += ","
            }
        }
    } else {
        str = onReplace(value);
    }
    return str;
}
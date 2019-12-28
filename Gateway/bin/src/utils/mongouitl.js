var mongo = require("mongodb");
var MongoConfig = {
    url: "mongodb://localhost:27017/"
};
mongo.MongoClient.connect(MongoConfig.url, { useNewUrlParser: true }, function (err, db) {
    if (err)
        throw err;
    console.log("数据库连接成功!");
    var dbo = db.db("runoob");
    var myobj = { name: "菜鸟教程", url: "www.runoob" };
    dbo.collection("site").insertOne(myobj, function (err, res) {
        if (err)
            throw err;
        console.log("文档插入成功");
        dbo.collection("site").findOne({
            name: "菜鸟教程"
        }, function (err, res) {
            if (err)
                throw err;
            db.close();
        });
    });
});
//# sourceMappingURL=mongouitl.js.map
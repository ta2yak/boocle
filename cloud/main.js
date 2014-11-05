// **************************************************************
// クラウドコード
// **************************************************************





// **************************************************************
// リレーション周りの自動実行処理
// **************************************************************
// 書籍情報が削除された場合、それに紐づく所有情報も削除する
Parse.Cloud.afterDelete("BookTitle", function(request) {

  query = new Parse.Query("BookOwner");

  // ※ Parseのドキュメントでは request.object.id となっているが request.object が正しい
  query.equalTo("book", request.object);
  query.find({
    success: function(bookOwners) {
      console.log("deleting related BookOwners " + bookOwners.length + " counts");

      Parse.Object.destroyAll(bookOwners, {
        success: function() {},
        error: function(error) {
          console.error("Error deleting related BookOwners " + error.code + ": " + error.message);
        }
      });
    },
    error: function(error) {
      console.error("Error finding related BookOwners " + error.code + ": " + error.message);
    }
  });
});

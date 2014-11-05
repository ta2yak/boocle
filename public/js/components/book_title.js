define(['react', "jquery", "underscore", 
        "models/session", "models/book_title_list",  "models/book_owner_list", 
        "mixins/authority"],
function(React, $, _, 
         SessionManager, BookTitleListModel, BookOwnerListModel, 
         AuthorityMixin){

  // ****************************************************
  // BookTitle
  // ****************************************************
  var BookTitleContainer = React.createClass({
    mixins: [AuthorityMixin],
    render: function() {
      return (
        <BookTitleBox/>
      );
    }
  });

  // ****************************************************
  // 輪読グループを制御するコンテナ
  // ****************************************************
  var BookTitleBox = React.createClass({
    getInitialState: function() {
      return {
        collection: new BookTitleListModel()
      };
    },
    /** 画面の状況を更新する **/
    refleshBox: function() {
      this.state.collection.fetchBookTitles(function(data){
                                           this.setState({collection: data});
                                        }.bind(this),
                                        function(error){
                                           swal("輪読グループの一覧を取得できませんでいsた", "再度ブラウザをリロードしてください", "error");
                                        }.bind(this));
    },
    // 行の新規追加を行う　(直接サーバに反映させる)
    addRow: function(_bookTitle){
      this.state.collection.create(_bookTitle, 
        {
          success:function(){
            swal("輪読対象書籍に追加しました", "", "success");
            this.refleshBox();
          }.bind(this),
          error:function(){
            swal("輪読対象書籍に追加できませんでした", "時間をおいて再度実行してください", "error");
          }.bind(this)
        }
      );
    },
    // 行の削除を行う　(直接サーバに反映させる)
    removeRow: function(_bookTitle){
      swal({
        title: "対象の輪読対象書籍を削除しますか?",
        text: "一度削除すると元には戻せません",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "削除する",
        closeOnConfirm: false
      },
      function(isConfirm){
        _bookTitle.destroy({
            success:function(){
              swal("対象の輪読対象書籍を削除しました", "", "success");
              this.refleshBox();
            }.bind(this),
            error:function(){
              swal("対象の輪読対象書籍の削除に失敗しました", "時間をおいて再度実行してください", "error");
            }.bind(this)
         });

      }.bind(this));


    },
    /** 全データを保存する **/
    saveCallback: function(e){
      var updateObjects = [];
      this.state.collection.each(function(_bookTitle) {
        updateObjects.push(_bookTitle);
      });

      Parse.Object.saveAll(updateObjects, {
          success: function(list) {
            l.stop();
            swal("保存しました", "", "success");
          }.bind(this),
          error: function(error) {
            l.stop();
            swal("一覧の保存に失敗しました", "時間をおいて再度実行してください", "error");
          }.bind(this),
      });

    },
    componentDidMount: function() {
      this.refleshBox();
    },
    render: function() {
      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <h1>輪読対象書籍の一覧</h1>
            </div>
          </div>
          <hr/>
          <BookTitleForm addCallback={this.addRow} />
          <br/>
          <BookTitleList collection={this.state.collection} removeCallback={this.removeRow} refleshCallback={this.refleshBox} />
          <br/>
          <hr/>
          <CommandList saveCallback={this.saveCallback} />
        </div>
      );
    }
  });

  // ****************************************************
  // 各種アクションを行うボタン
  // ****************************************************
  var CommandList = React.createClass({
    render: function() {
      return (
        <div className="row">
          <div className="col-md-12">
            <div className="btn-group pull-right">
              <button className="btn btn-success" onClick={this.props.saveCallback} >
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  });

  // ****************************************************
  // 輪読対象書籍の一覧
  // ****************************************************
  var BookTitleList = React.createClass({
    render: function() {
      var bookTitleNodes = this.props.collection.map(function (_bookTitle) {
        return (
          <BookTitle bookTitle={_bookTitle}　key={_bookTitle.id} removeCallback={this.props.removeCallback} />
        );
      }.bind(this));
      return (
        <div>
          <table className="table table-condensed table-hover">
            <thead>
              <tr>
                <th>所有</th>
                <th>書籍名</th>
                <th>ISBN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookTitleNodes}
            </tbody>
          </table>
        </div>
      );
    }
  });


  // ****************************************************
  // 輪読対象書籍の明細
  // ****************************************************
  var BookTitle = React.createClass({
    getInitialState: function() {
      return {
        hasBook: null
      };
    },
    componentDidMount: function() {
      this.refleshHasState();  
    },
    toHasState: function(){
      var bookOwnerList = new BookOwnerListModel();
      bookOwnerList.create({
        book: this.props.bookTitle,
        used: false,
        owner: Parse.User.current()
      }, {
        success: function(){
          this.refleshHasState();  
        }.bind(this),
        error: function(){

        }
      });
    },
    toNotHaveState: function(){
      this.state.hasBook.destroy({
        success: function(){
          this.refleshHasState();  
        }.bind(this),
        error: function(){

        }
      });
    },
    refleshHasState: function(){
      BookOwnerListModel.hasBook(
        this.props.bookTitle, 
        function(data){
          this.setState({
            hasBook: data
          })
        }.bind(this),
        function(error){
           swal("書籍の所有情報が取得できませんでいsた", "再度ブラウザをリロードしてください", "error");
        }.bind(this));
    },
    handleDelete: function(event) {
      this.props.removeCallback(this.props.bookTitle);
    },
    setName: function(event) {
      this.props.bookTitle.set("name", event.target.value);
    },
    setISBN: function(event) {
      this.props.bookTitle.set("isbn", event.target.value);
    },
    render: function() {
      var have_state_el = <input type="button" className="btn btn-success" value="自分持ってます" onClick={this.toHasState}/>;
      if (this.state.hasBook) {
        have_state_el = <input type="button" className="btn btn-danger" value="捨てた" onClick={this.toNotHaveState}/>;
      };

      return (
        <tr>
          <td>
            <div>
              {have_state_el}
            </div>
          </td>
          <td>
            <div>
              <input type="text" defaultValue={this.props.bookTitle.get("name")} className="form-control" ref="name" onChange={this.setName}/>
            </div>
          </td>
          <td>
            <div>
              <input type="text" defaultValue={this.props.bookTitle.get("isbn")} className="form-control" ref="isbn" onChange={this.setISBN}/>
            </div>
          </td>
          <td>
            <div>
              <input type="button" className="btn btn-danger" value="削除" onClick={this.handleDelete}/>
            </div>
          </td>
        </tr>
      );
    }
  });

  // ****************************************************
  // 輪読対象書籍の登録フォーム
  // ****************************************************
  var BookTitleForm = React.createClass({
    handleAdd: function(e) {
      e.preventDefault();
      var name = this.refs.name.getDOMNode().value.trim();
      var isbn = this.refs.isbn.getDOMNode().value.trim();
      if (!name) {
        swal({
          title: "エラー",
          text: "未設定の項目が存在します",
          type: "warning",
          showCancelButton: false,
          confirmButtonClass: "btn-danger",
          confirmButtonText: "OK",
          closeOnConfirm: false
        });
        return;
      }

      this.props.addCallback({
        name: name,
        isbn: isbn
      });

      this.refs.name.getDOMNode().value = '';
      this.refs.isbn.getDOMNode().value = '';
      return;
    },
    render: function() {
      return (
        <div>
          <table className="table table-condensed table-hover">
            <thead>
              <tr>
                <th>書籍名</th>
                <th>ISBN</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div>
                    <input type="text" className="form-control" ref="name"/>
                  </div>
                </td>
                <td>
                  <div>
                    <input type="text" className="form-control" ref="isbn"/>
                  </div>
                </td>
                <td>
                  <div>
                    <input type="button" className="btn btn-info" value="追加" onClick={this.handleAdd}/>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      );
    }
  });


  return BookTitleContainer;
});

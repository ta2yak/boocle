define(['react', 
        "models/comment_list", "models/session", 
        "mixins/authority"],
  function(React, 
           CommentListModel, SessionManager, 
           AuthorityMixin){

  // ****************************************************
  // Comment
  // ****************************************************
  var CommentComponent = React.createClass({
    mixins: [AuthorityMixin],
    getInitialState: function() {
      return {
        comments : new CommentListModel()
      };
    },
    componentDidMount: function() {
      this.refleshComment();  
    },
    refleshComment: function(){
      this.state.comments.fetchComments(this.props.parent, 
        function(comments){
          this.setState({
            comments: comments
          });
        }.bind(this),
        function(error){
           swal("コメントが取得できませんでいsた", "再度ブラウザをリロードしてください", "error");
        }.bind(this));
    },
    render: function() {
      var dataId = this.props.dataId;
      var dataTarget = "#" + this.props.dataId;
      var commentButtonTitle = this.state.comments.length + " コメント";

      var buttonClass = "btn " + this.props.buttonClass;

      return (
        <div>
          <div className="btn-group">
            <button className={buttonClass} data-toggle="modal" data-target={dataTarget}><span>{commentButtonTitle}</span></button>
          </div>
          <div className="modal fade" id={dataId} role="dialog" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                  <h4 className="modal-title">コメント</h4>
                </div>
                <div className="modal-body">
                  <CommentArea parent={this.props.parent} comments={this.state.comments} refleshCallback={this.refleshComment} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  /* コメント一覧 */
  var CommentArea = React.createClass({
    render: function() {

      var comments_el = this.props.comments.map(function(comment, i) {
        return <Comment comment={comment} key={comment.id}　refleshCallback={this.props.refleshCallback} />
      }.bind(this));

      return (
        <div className="list-group">
          {comments_el}
          <CommentForm parent={this.props.parent} comments={this.props.comments}　refleshCallback={this.props.refleshCallback}/>
        </div>
      );
    }
  });

  /* コメント一覧 */
  var Comment = React.createClass({
    getInitialState: function() {
      return {
        author: null,
      };
    },
    componentDidMount: function() {
      this.props.comment.get("author").fetch({
        success: function(user){
          this.setState({
            author: user
          });
        }.bind(this),
        error : function(data, error){
          swal("コメント登録者の取得に失敗しました", "再度実行してください", "error");
        }.bind(this)
      });
    },
    removeComment: function(){

      swal({
        title: "コメントを削除しますか?",
        text: "",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "削除とする",
        closeOnConfirm: false
      },
      function(isConfirm){

        this.props.comment.destroy({
          success: function(data){
            swal("コメントを削除しました", "", "success");
            this.props.refleshCallback();
          }.bind(this),
          error: function(data, error){
            swal("コメントの削除に失敗しました", "再度実行してください", "error");
          }.bind(this)
        });

      }.bind(this));

    },
    render: function() {
      return (
        <a className="list-group-item">
          <blockquote>
            <p>{this.props.comment.get("text")}</p>
            {this.state.author ? <footer>{this.state.author.get("screenname")}</footer> : null}
            {this.state.author && 
             this.state.author.get("username") === Parse.User.current().get("username") ? 
                <button type="button" className="close" onClick={this.removeComment}>
                  <span aria-hidden="true">&times;</span>
                  <span className="sr-only">Close</span>
                </button> : null}
          </blockquote>
        </a>
      );
    }
  });

  /* コメント登録 */
  var CommentForm = React.createClass({
    addComment: function(){
      var text = this.refs.text.getDOMNode().value.trim();
      if (!text) {
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

      this.props.comments.create({
        parent: this.props.parent.id,
        text: text,
        author: Parse.User.current()
      }, {
        success: function(data){
          swal("コメントを投稿しました", "", "success");
          this.refs.text.getDOMNode().value = "";
          this.props.refleshCallback();
        }.bind(this),
        error: function(data, error){
          swal("コメントの登録に失敗しました", "再度実行してください", "error");
        }.bind(this)

      });

    },
    render: function() {
      return (
        <a className="list-group-item">
          <div className="row">
            <div className="col-md-10">
              <input type="text" className="form-control" ref="text"/>
            </div>
            <div className="col-md-2">
              <input type="button" className="btn btn-info" value="追加" onClick={this.addComment}/>
            </div>
          </div>
        </a>
      );
    }
  });


  return CommentComponent;
});

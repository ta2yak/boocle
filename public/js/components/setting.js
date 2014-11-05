define(['react', "models/session", "mixins/authority"],function(React, SessionManager, AuthorityMixin){

  // ****************************************************
  // Setting
  // ****************************************************
  var Setting = React.createClass({
    mixins: [AuthorityMixin],
    handleSetting: function(e) {
      e.preventDefault();
      var username = this.refs.username.getDOMNode().value.trim();
      var screenname = this.refs.screenname.getDOMNode().value.trim();
      var workplace = this.refs.workplace.getDOMNode().value.trim();
      if (!username || !screenname || !workplace) {

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

      var user = SessionManager.getInstance().getCurrentUser();
      user.set("username", username);
      user.set("screenname", screenname);
      user.set("workplace", workplace);

      user.save(null, {
        success: function(user){
            swal("ユーザ情報を更新しました", "", "success");
        }.bind(this),
        error: function(user, error){
            swal("ユーザ登録に失敗しました", error.message, "error");
        }.bind(this)
      });

      return;
    },
    render: function() {
      var user = SessionManager.getInstance().getCurrentUser()
      return (
        <div>
          <div className="row">
              <div className="col-sm-8 col-md-6 col-md-offset-2">
                  <h1 className="text-center setting-title">ユーザ設定</h1>
                  <div className="account-wall">
                      <img className="profile-img" src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120"
                          alt="" />
                      <form className="setting-form" onSubmit={this.handleSetting}>
                        <label>ユーザ情報</label>
                        <input type="text" defaultValue={user.get("username")} className="form-control" placeholder="社員番号" required autofocus ref="username" />
                        <input type="text" defaultValue={user.get("screenname")} className="form-control" placeholder="名前" required ref="screenname" />
                        <input type="text" defaultValue={user.get("workplace")} className="form-control" placeholder="勤務先" required ref="workplace" />
                        <hr/>
                        <button className="btn btn-lg btn-primary btn-block" type="submit">Save</button>
                      </form>
                  </div>
              </div>
          </div>
        </div>
      );
    }
  });

  return Setting;
});

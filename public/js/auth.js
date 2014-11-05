/** @jsx React.DOM */

require(["jquery", "react", "models/session", 
         "jsx!components/navigation"], 
function($, React, SessionManager, 
         Navigation){

  // ****************************************************
  // 新規登録フォーム
  // ****************************************************
  var SignupForm = React.createClass({
    handleSignup: function(e) {
      e.preventDefault();
      var username = this.refs.username.getDOMNode().value.trim();
      var name = this.refs.name.getDOMNode().value.trim();
      var password = this.refs.password.getDOMNode().value.trim();
      if (!password || !username || !name) {
        return;
      }

      // 新規登録を行うので改めてセッションモデルを作成する
      var session = SessionManager.getInstance();
      session.signup({username: username, name: name, password: password}, {
          success: function(user) {
            // 新規登録が完了したら新しいセッションモデルを使用して認証済みコンテンツを再表示する
            this.props.callback("allow");
          }.bind(this),
          error: function(user, error){
            // エラー表示する
            swal("ユーザ登録に失敗しました", error.message, "error");
          }.bind(this)
      });

      this.refs.username.getDOMNode().value = '';
      this.refs.name.getDOMNode().value = '';
      this.refs.password.getDOMNode().value = '';
      return;
    },
    handleBackLink: function(e) {
      this.props.callback("login");
      return;
    },
    render: function() {
      return (
        <div>
          <div className="row">
              <div className="col-sm-6 col-md-4 col-md-offset-4">
                  <h1 className="text-center signup-title">Welcome to Boocle</h1>
                  <div className="account-wall">
                      <img className="profile-img" src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120"
                          alt="" />
                      <form className="signup-form" onSubmit={this.handleSignup}>
                        <input type="text" className="form-control" placeholder="社員番号" required autofocus ref="username" />
                        <input type="text" className="form-control" placeholder="名前" required ref="name" />
                        <input type="password" className="form-control" placeholder="パスワード" required ref="password" />
                        <button className="btn btn-lg btn-primary btn-block" type="submit">Register</button>
                      </form>
                  </div>
                  <a href="#" className="text-center new-account" onClick={this.handleBackLink}>Back</a>
              </div>
          </div>
        </div>
      );
    }
  });


  // ****************************************************
  // ログインフォーム
  // ****************************************************
  var LoginForm = React.createClass({
    handleLogin: function(e) {
      e.preventDefault();
      var username = this.refs.username.getDOMNode().value.trim();
      var password = this.refs.password.getDOMNode().value.trim();
      if (!password || !username) {
        return;
      }

      var session = SessionManager.getInstance();
      session.login({username: username, password: password}, {
          success: function(user) {
          }.bind(this),
          error: function(user, error){
            swal("ログインに失敗しました", error.message, "error");
          }.bind(this)
      });

      this.refs.username.getDOMNode().value = '';
      this.refs.password.getDOMNode().value = '';
      return;
    },
    handleSignUpLink: function(e) {
      this.props.callback("signup");
      return;
    },
    render: function() {
        return (
          <div>
            <div className="row">
                <div className="col-sm-6 col-md-4 col-md-offset-4">
                    <h1 className="text-center login-title">Welcome to Boocle</h1>
                    <div className="account-wall">
                        <img className="profile-img" src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120"
                            alt="" />
                        <form className="login-form" onSubmit={this.handleLogin}>
                          <input type="text" className="form-control" placeholder="社員番号" required autofocus ref="username" />
                          <input type="password" className="form-control" placeholder="パスワード" required ref="password" />
                          <button className="btn btn-lg btn-primary btn-block" type="submit">
                              Sign in</button>
                        </form>
                    </div>
                    <a href="#" className="text-center new-account" onClick={this.handleSignUpLink}>Create an account </a>
                </div>
            </div>
          </div>
      );

    }
  });


  // ****************************************************
  // メニュー
  // ****************************************************
  var ContentWithNavigation = Navigation;

  // ****************************************************
  // 認証用コンテナー
  // ****************************************************
  var AuthorizableContainer = React.createClass({
    getInitialState: function() {
      return {
        authState: "blank" // サーバへの問合せ時間の間は空ページを表示させる
      };
    },

    componentWillMount: function() {
      SessionManager.getInstance().on('change', function() {
        this.setState({
          authState: SessionManager.getInstance().get("logged_in") ? "allow" : "login"
        });
      }.bind(this));
      this.fetchUser();
    },
    // コンテンツの表示前にユーザ情報を取得する
    fetchUser: function() {
      var session = SessionManager.getInstance();
      session.checkAuth({
        success: function() {

        }.bind(this),
        error: function(){
          console.error("セッション情報が取得できませんでした");
          }.bind(this)
      });

    },

    authStateCallback: function(state) {
      this.setState({
        authState: state
      });
      return;
    },


    render: function() {

      switch (this.state.authState){
        case "allow":
          return (
            <ContentWithNavigation/>
          );
          break;
        case "signup":
          return(
            <SignupForm callback={this.authStateCallback} />
            );
          break;
        case "login":
          return (
            <LoginForm callback={this.authStateCallback} />
          );
          break;
        case "blank":
          return (
            <div></div>
          );
          break;
        }
    }
  });


  React.renderComponent(<AuthorizableContainer/>, 
                        document.getElementById('content'));

});

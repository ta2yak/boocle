define(['react'
	  , "models/session"
    , "jsx!components/home"
	  , "jsx!components/group"
    , "jsx!components/book_title"
    , "jsx!components/rule"
	  , "jsx!components/setting"],
function(React
	   , SessionManager
     , Home
	   , Group
     , BookTitle
     , Rule
	   , Setting){

  // ****************************************************
  // メニュー
  // ****************************************************
  var Navigation = React.createClass({
    getInitialState: function() {
      return {
        viewState: location.hash ? location.hash.replace("#", "") : "home"
      };
    },
    handleHomeLink: function(e) {
      $("#wrapper").removeClass("toggled");
	    this.setState({
	        viewState: "home"
	    });
    	return;
    },
    handleGroupLink: function(e) {
      $("#wrapper").removeClass("toggled");
	    this.setState({
	        viewState: "group"
	    });
      return;
    },
    handleBookTitleLink: function(e) {
      $("#wrapper").removeClass("toggled");
      this.setState({
          viewState: "book_title"
      });
      return;
    },
    handleSettingLink: function(e) {
      $("#wrapper").removeClass("toggled");
	    this.setState({
	        viewState: "setting"
	    });
      return;
    },
    handleRuleLink: function(e) {
      $("#wrapper").removeClass("toggled");
      this.setState({
          viewState: "rule"
      });
      return;
    },
    handleLogoutLink: function(e) {
      SessionManager.getInstance().logout();
      return;
    },
    isNormal: function(){
    	return SessionManager.getInstance().getCurrentUser().get("authority") != "admin";
    },
    isAdmin: function(){
    	return SessionManager.getInstance().getCurrentUser().get("authority") == "admin";
    },
    toggleMenu: function(e){
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    },
    render: function() {
	  var homeDisplay = (this.state.viewState == "home");
	  var groupDisplay = (this.state.viewState == "group");
    var bookTitleDisplay = (this.state.viewState == "book_title");
	  var settingDisplay = (this.state.viewState == "setting");
    var ruleDisplay = (this.state.viewState == "rule");

      return (

	    <div id="wrapper">

	        <div id="sidebar-wrapper">
	            <ul className="sidebar-nav">
	                <li className="sidebar-brand">
	                    <a href="#" onClick={this.handleHomeLink}>
	                        Boocle
	                    </a>
	                </li>
                    <li className={homeDisplay ? "active":null}><a href="#home" onClick={this.handleHomeLink}>Home</a></li>
                    <li className={bookTitleDisplay ? "active":null}><a href="#book_title" onClick={this.handleBookTitleLink}>書籍</a></li>
                    <li><br/></li>
                    <li className={groupDisplay ? "active":null}><a href="#group" onClick={this.handleGroupLink}>輪読グループ</a></li>
                    <li className={settingDisplay ? "active":null}><a href="#setting" onClick={this.handleSettingLink}>ユーザ情報</a></li>
                    <li className={ruleDisplay ? "active":null}><a href="#rule" onClick={this.handleRuleLink}>ルール</a></li>
                    <li><br/></li>
                    <li><a href="#" onClick={this.handleLogoutLink}>ログアウト</a></li>
	            </ul>
	        </div>

	        <div id="page-content-wrapper">
	            <div className="container-fluid">
                <div className="row">
                  <div className="hidden-md hidden-lg hidden-sm">
                    <a href={"#"+this.state.viewState} className="btn btn-default" onClick={this.toggleMenu}>Menu</a>
                    <hr/>
                  </div>
                </div>
                <div id="page-content-part">
                  { homeDisplay ? <Home /> : null }
    			        { groupDisplay ? <Group /> : null }
                  { bookTitleDisplay ? <BookTitle /> : null }
    			        { settingDisplay ? <Setting /> : null }
                  { ruleDisplay ? <Rule /> : null }
                </div>
	            </div>
	        </div>

	    </div>

      );
    }
  });

  	return Navigation;
});

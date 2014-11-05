
define(['react', "models/session"],function(React, SessionManager){

	var AuthorityMixin = {
		componentDidMount: function() {
			console.log("Authority Checking");
			var session = SessionManager.getInstance();
			session.checkAuth({}); // Sesisonオブジェクトの内容が変わると自動的に反映される
		}
	};

	return AuthorityMixin;
});

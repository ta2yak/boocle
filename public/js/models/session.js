define(['parse', 'backbone'],function(Parse, Backbone){

    var Session = Parse.Object.extend("Session", {
        constructor: function(){
            if(!Session.instance){
                Session.instance = this;
                Parse.Object.apply(Session.instance, arguments);
            }
            return Session.instance;
        },
        initialize: function (attrs, options) {
            this.set("logged_in", false)
        },
        getCurrentUser: function(){
            return Parse.User.current();
        },
        checkAuth: function(callback) {
            var self = this;
            if (Parse.User.current() === null) {
                self.set({ logged_in : false });
                if('error' in callback) callback.error();    
                return;
            };

            Parse.User.current().fetch({
                success:function(user){
                    self.set({ logged_in : true });
                    if('success' in callback) callback.success();    
                },
                error:function(user, error){
                    self.set({ logged_in : false });
                    if('error' in callback) callback.error();    
                }
            });
        },
        login: function(opts, callback){
            var self = this;
            Parse.User.logIn(opts.username, opts.password, {
              success: function(user) {
                console.log(this);
                self.set({ logged_in : true });
                if( callback && 'success' in callback ) callback.success(user);
              },
              error: function(user, error) {
                self.set({ logged_in : false });
                if( callback && 'error' in callback ) callback.error(user, error);
              }
            });

        },

        logout: function(){
            this.set({ logged_in : false });
            Parse.User.logOut();
        },

        signup: function(opts, callback){
            var self = this;
            var user = new Parse.User();
            user.set("username", opts.username);
            user.set("screenname", opts.name);
            user.set("password", opts.password);
            user.signUp(null, {
              success: function(user) {
                self.set({ logged_in : true });
                if( callback && 'success' in callback ) callback.success(user);
              },
              error: function(user, error) {
                self.set({ logged_in : false });
                if( callback && 'error' in callback ) callback.error(user, error);
              }
            });

        }

    });


    var SessionManager = {
        getInstance: function(){
            return new Session();
        }
    }

	return SessionManager;
});



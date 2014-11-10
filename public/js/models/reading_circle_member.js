define(['parse'],function(Parse){

    var ReadingCircleMember = Parse.Object.extend("ReadingCircleMember", {

		isSkip: function(){
	      return this.get("isSkip");
		},

		isFinish: function(){
	      return this.get("isFinish");
		},

		toSkip: function(successCallback, failedCallback){
	      this.set("isSkip", true);
	      this.set("skipedAt", new Date());
	      this.save({
	        success: function(data){
	        	successCallback(data);
	        }.bind(this),
	        error: function(error){
	        	failedCallback(error);
	        }.bind(this)
	      });

		},
		toFinish: function(successCallback, failedCallback){
	      this.set("isFinish", true);
	      this.set("finishedAt", new Date());
	      this.save({
	        success: function(data){
	        	successCallback(data);
	        }.bind(this),
	        error: function(error){
	        	failedCallback(error);
	        }.bind(this)
	      });

		}

    }, {

    });

	return ReadingCircleMember;
});



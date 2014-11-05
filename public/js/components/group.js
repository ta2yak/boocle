define(['react', "jquery", "underscore", 
        "models/session", "models/group_list", "models/group_member_list", "models/user_list",
        "mixins/authority"],
function(React, $, _, 
         SessionManager, GroupListModel, GroupMemberListModel, UserListModel,
         AuthorityMixin){

  // ****************************************************
  // Group
  // ****************************************************
  var GroupContainer = React.createClass({
    mixins: [AuthorityMixin],
    render: function() {
      return (
        <GroupBox/>
      );
    }
  });

  // ****************************************************
  // 輪読グループを制御するコンテナ
  // ****************************************************
  var GroupBox = React.createClass({
    getInitialState: function() {
      return {
        collection: new GroupListModel()
      };
    },
    /** 画面の状況を更新する **/
    refleshBox: function() {
      this.state.collection.fetchGroups(function(data){
                                           this.setState({collection: data});
                                        }.bind(this),
                                        function(error){
                                           swal("輪読グループの一覧を取得できませんでいsた", "再度ブラウザをリロードしてください", "error");
                                        }.bind(this));
    },
    // 行の新規追加を行う　(直接サーバに反映させる)
    addRow: function(_group){
      this.state.collection.create(_group, 
        {
          success:function(){
            swal("輪読グループに追加しました", "", "success");
            this.refleshBox();
          }.bind(this),
          error:function(){
            swal("輪読グループに追加できませんでした", "時間をおいて再度実行してください", "error");
          }.bind(this)
        }
      );
    },
    // 行の削除を行う　(直接サーバに反映させる)
    removeRow: function(_group){
      swal({
        title: "対象の輪読グループを削除しますか?",
        text: "一度削除すると元には戻せません",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "削除する",
        closeOnConfirm: false
      },
      function(isConfirm){
        _group.destroy({
            success:function(){
              swal("対象の輪読グループを削除しました", "", "success");
              this.refleshBox();
            }.bind(this),
            error:function(){
              swal("対象の輪読グループの削除に失敗しました", "時間をおいて再度実行してください", "error");
            }.bind(this)
         });

      }.bind(this));


    },
    /** 全データを保存する **/
    saveCallback: function(e){
      var updateObjects = [];
      this.state.collection.each(function(_group) {
        updateObjects.push(_group);
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
              <h1>輪読グループ</h1>
            </div>
          </div>
          <hr/>
          <CommandList saveCallback={this.saveCallback} />
          <hr/>
          <GroupList collection={this.state.collection} removeCallback={this.removeRow} refleshCallback={this.refleshBox} />
          <br/>
          <GroupForm addCallback={this.addRow} />
          <br/>
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
  // 輪読グループの一覧
  // ****************************************************
  var GroupList = React.createClass({
    render: function() {
      var groupNodes = this.props.collection.map(function (_group) {
        return (
          <Group group={_group}　key={_group.id} removeCallback={this.props.removeCallback} />
        );
      }.bind(this));
      return (
        <div>
          <table className="table table-condensed table-hover">
            <thead>
              <tr>
                <th>グループ名</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {groupNodes}
            </tbody>
          </table>
        </div>
      );
    }
  });


  // ****************************************************
  // 輪読グループの明細
  // ****************************************************
  var Group = React.createClass({
    getInitialState: function() {
      return {
        allMembers: new UserListModel()
      };
    },
    componentDidMount: function() {
      this.state.allMembers.fetchUsers(
        function(users){
          this.setState({
            allMembers: users
          })
        }.bind(this),
        function(error){

        }
      );
    },
    handleDelete: function(event) {
      this.props.removeCallback(this.props.group);
    },
    setName: function(event) {
      this.props.group.set("name", event.target.value);
    },
    render: function() {
      return (
        <tr>
          <td>
            <div>
              <input type="text" defaultValue={this.props.group.get("name")} className="form-control" ref="name" onChange={this.setName}/>
            </div>
          </td>
          <td>
            <GroupMembers　group={this.props.group} allMembers={this.state.allMembers}/>
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

  var GroupMembers = React.createClass({
    getInitialState: function() {
      return {
        collection: new GroupMemberListModel()
      };
    },
    componentDidMount: function() {
      this.refleshBox();
    },
    refleshBox: function() {
      this.state.collection.fetchGroupMembers(this.props.group, 
                                              function(data){
                                                this.setState({collection: data});
                                              }.bind(this),
                                              function(error){
                                                swal("メンバーを取得できませんでした", "再度ブラウザをリロードしてください", "error");
                                              }.bind(this));
    },
    removeMember: function(_member){
      swal({
        title: "対象のユーザをグループから外しますか?",
        text: "",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "削除する",
        closeOnConfirm: false
      },
      function(isConfirm){
        _member.destroy({
            success:function(){
              swal("対象のユーザをグループから外しました", "", "success");
              this.refleshBox();
            }.bind(this),
            error:function(){
              swal("対象のユーザをグループから外せませんでした", "時間をおいて再度実行してください", "error");
            }.bind(this)
         });

      }.bind(this));
      
    },
    joinMember: function(user){
      this.state.collection.create({
        group: this.props.group,
        user: user
      }, {
        success: function(obj){
          swal("メンバーを追加しました", "", "success");
          this.refleshBox();
        }.bind(this),
        error: function(obj, error){
           swal("グループに参加できませんでした", "再度実行してください", "error");
        }.bind(this)
      });
    },
    render: function() {
      var memberNodes = this.state.collection.map(function (_groupMember) {
        return (
          <Member member={_groupMember}　key={_groupMember.id} allMembers={this.props.allMembers} removeCallback={this.removeMember} />
        );
      }.bind(this));

      // 一意のIDを生成する
      var dataTarget = "#memberModal" + this.props.group.id;
      var dataId     = "memberModal" + this.props.group.id;

      return (
        <div>
          <button type="button" className="btn btn-primary" data-toggle="modal" data-target={dataTarget}>
            メンバー管理
          </button>
          <div className="modal fade" id={dataId} role="dialog" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                  <h4 className="modal-title">{this.props.group.get("name")}</h4>
                </div>
                <div className="modal-body">
                    <table className="table table-condensed table-hover">
                      <tbody>
                        {memberNodes}
                        <MemberForm allMembers={this.props.allMembers} joinCallback={this.joinMember}/>
                      </tbody>
                    </table>
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

  var Member = React.createClass({
    getInitialState: function() {
      return {
        user: null
      };
    },
    componentDidMount: function() {
      this.props.member.get("user").fetch({
        success:function(user){
          this.setState({
            user: user
          })
        }.bind(this),
        error: function(user, error){
           swal("ユーザ情報が取得できませんでした", "再度実行してください", "error");
        }
      });
    },
    handleDelete: function(event) {
      this.props.removeCallback(this.props.member);
    },
    render: function() {
      return (
        <tr>
          <td>
            <div>
              { this.state.user ? <label className="form-control">{this.state.user.get("screenname")}</label> : null }
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

  var MemberForm = React.createClass({
    handleAdd: function(event) {
      var selectedUserNo = this.refs.member.getDOMNode().value;

      var user = this.props.allMembers.find(function(member){
                                              return member.get("username") === selectedUserNo;
                                            });
      this.props.joinCallback(user);
    },
    render: function() {
      var members = this.props.allMembers;
      var options = members.map(function(member, i) {
            return <option value={member.get("username")} key={member.id}>{member.get("screenname")}</option>
      });

      return (
        <tr>
          <td>
            <div>
              <select className="form-control" ref="member">
                {options}
              </select>
            </div>
          </td>
          <td>
            <div>
              <input type="button" className="btn btn-success" value="追加" onClick={this.handleAdd}/>
            </div>
          </td>
        </tr>
      );
    }
  });

  // ****************************************************
  // 輪読グループの登録フォーム
  // ****************************************************
  var GroupForm = React.createClass({
    handleAdd: function(e) {
      e.preventDefault();
      var name = this.refs.name.getDOMNode().value.trim();
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
        name: name
      });

      this.refs.name.getDOMNode().value = '';
      return;
    },
    render: function() {
      return (
        <div>
          <table className="table table-condensed table-hover">
            <thead>
              <tr>
                <th>グループ名</th>
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


  return GroupContainer;
});

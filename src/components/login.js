import {useState, useEffect} from 'react';
import  {GETJWTTOKEN, GETROLESLIST, GETROLESPERMISSIONS, GETMENUITEMSACTIONS, GETMENUITEMSACTIONSADDITIONAL, CLEARPERMISSIONS } from '../components/rolePermissionsStore'
import {connect} from 'react-redux'; 
import axios from 'axios';
import Assignmenu from './assign_menus';
import {apiCallBasePath} from './apiconfig'

const LoginPage = (props) => {
    const loginUser = () => {
        let  access_token = '';
        const userLoginDetails = {
            login: "admin@zaigoinfotech.com",
            password: "Admin@123"
        }
        axios.post(apiCallBasePath+'auth/login', userLoginDetails)
        .then(res => {
            access_token = res.data.data.access_token;
            props.GetAuthorizeToken(access_token);                         
        }).catch((error) => {
            console.log(error)

        });
    }    
    const getRoleDetails = () => {
        if(props.token!=='' && props.token!=='dummy') {
            axios({
                url: apiCallBasePath+'roles?keyword=roleimge',
                method: 'get',
                headers: {                
                    "Authorization": "Bearer "+props.token
                }
            })
            .then(response => {                 
                const rolesList = response.data.data;                
                if(Array.isArray(rolesList)) {
                    if(rolesList.length > 0 ) {
                        getRolePermissions(rolesList[0].encrypted_id);
                    }
                }
                props.GetRoles(rolesList);                          
            }) 
            .catch(err => {
                console.log(err);
            });
        }
    }
    const getRolePermissions = (roleId) => {    
        if(roleId!==undefined && roleId!=="") {
                axios({
                url: apiCallBasePath+'roles/rolexmenuitemactionsassigned/'+roleId,
                method: 'get',
                headers: {                
                    "Authorization": "Bearer "+props.token
                }
            })
            .then(response => {              
                const rolesPermissions = response.data.data;  
                props.GetRolesPermissions(rolesPermissions);
            }) 
            .catch(err => {
                console.log(err);
            });
        }
    }
    const storePermissions = () => {
        console.log("Inside Store Permisison")
        if( props.permission.length > 0 ) {      
         const updatePermittedMenuItemsActions = [];
         const updatedKeys = [];
         const permittedKeys = [];
         for(let pi=0; pi < props.permission.length; pi++) {            
            updatePermittedMenuItemsActions[props.permission[pi].menuItemId] = [];           
            if( props.permission[pi].hasOwnProperty('menuItemActions') ) {
                updatePermittedMenuItemsActions[props.permission[pi].menuItemId] = props.permission[pi].menuItemActions
                updatedKeys.push(props.permission[pi].menuItemId)
            }
         }  
         const roleDetails = props.roles;
         const permittedMenuItemsActions = [];
                   if(roleDetails.length > 0 ) {
                       if(roleDetails[0].hasOwnProperty("permissionData")){
                           const permissionData = roleDetails[0].permissionData;
                           if(permissionData.hasOwnProperty("menuItemsActionsAssigned")){ 
                               const menuItemsActionsAssigned = permissionData.menuItemsActionsAssigned;                             
                               const perObjValues = Object.values(menuItemsActionsAssigned);                              
                               if(perObjValues.length>0){
                                   for(let poi=0; poi < perObjValues.length; poi++) {
                                    permittedKeys.push(perObjValues[poi].encryptedId);
                                       permittedMenuItemsActions[perObjValues[poi].encryptedId]=[];
                                       if(perObjValues[poi].hasOwnProperty("actionsAssigned")){                                          
                                           const actObjValues = Object.values(perObjValues[poi].actionsAssigned);                                          
                                           if(actObjValues.length>0){
                                               for(let pai=0; pai < actObjValues.length; pai++) {
                                                   permittedMenuItemsActions[perObjValues[poi].encryptedId].push(actObjValues[pai].encryptedId);                                              
                                               }
                                           }
                                       }
                                   }
                               }
                           }
                       }
                   } 
            let combinedPer = updatedKeys.concat(permittedKeys);
            let uniquePerKeys = combinedPer.filter((item, index) => {
                return combinedPer.indexOf(item)===index;
            });
            let menuitems_actions_json_updated = '{';
            if(uniquePerKeys.length>0) {
            for(let pi=0; pi < uniquePerKeys.length; pi++) {            
                if(menuitems_actions_json_updated !=='' && menuitems_actions_json_updated!=='{') {
                    menuitems_actions_json_updated = menuitems_actions_json_updated +',';
               }
               menuitems_actions_json_updated = menuitems_actions_json_updated + '"'+uniquePerKeys[pi]+'":[';  
             let  actionsArr = [];           
             if( updatePermittedMenuItemsActions.hasOwnProperty(uniquePerKeys[pi]) ) {
                actionsArr = updatePermittedMenuItemsActions[uniquePerKeys[pi]];
             } else if( Array.isArray(permittedMenuItemsActions) && permittedMenuItemsActions.hasOwnProperty(uniquePerKeys[pi]) ) {
                actionsArr = permittedMenuItemsActions[uniquePerKeys[pi]];
             }
             if(actionsArr.length > 0 ) {
                 let actionsStr = '';
                 for(let ai = 0 ; ai < actionsArr.length; ai++ ) {
                   if(actionsStr!=='') {
                      actionsStr = actionsStr +',';
                   }
                  actionsStr = actionsStr + '"'+actionsArr[ai]+'"';               
                 }
                 menuitems_actions_json_updated = menuitems_actions_json_updated + actionsStr;
             }
             menuitems_actions_json_updated = menuitems_actions_json_updated + ']';          
            }
            menuitems_actions_json_updated = menuitems_actions_json_updated + '}';
        }  
           const permissionDetails = {
                menuitems_actions_json: menuitems_actions_json_updated,
                clear_menuitems_actions_to_role:0
            }     
            if(props.roles[0].encrypted_id!==undefined) {
                console.log("Inside Store Permisison 3")
                    axios({
                    url: apiCallBasePath+'roles/rolexmenuitemactionassign/'+props.roles[0].encrypted_id,
                    method: 'post',
                    headers: {                
                        "Authorization": "Bearer "+props.token                        
                    },
                    data: permissionDetails
                })
                .then(response => {
                    getRolePermissions(props.roles[0].encrypted_id);  
                    setAssignMenus(0)
                    props.clearPermissions();       
                }) 
                .catch(err => {
                    console.log("-------------ERROR-------------");
                    console.log(err.message);
                });
            } 
        } else {
            setAssignMenus(0)
            props.clearPermissions();
        }
    }
    const getMenuItems = () => {
        if(props.token !=='' && props.token!=='dummy' && props.menus.length===0) { 
                axios({
                url: apiCallBasePath+'menuitems',
                method: 'get',
                headers: {                
                    "Authorization": "Bearer "+props.token
                }
            })
            .then(response => {
                const menus = response.data.data.menuItems.data;
                props.GetMenuItemsActions(menus);
                const apiPath = response.data.data.menuItems.path;
                for(let aci = parseInt(response.data.data.menuItems.current_page)+parseInt(1) ; aci <= parseInt(response.data.data.menuItems.last_page); aci++ ) { 
                    axios({
                        url: apiPath+'?page='+aci,
                        method: 'get',
                        headers: {                
                            "Authorization": "Bearer "+props.token
                        }
                    })
                    .then(lresponse => {               
                        const lmenus = lresponse.data.data.menuItems.data;              
                        props.getMenuItemsActionsAdditional(lmenus);
                    });
                }          

            }) 
            .catch(err => {
                console.log(err);
            });
        }
    }   
    if(props.token==="dummy") {
        loginUser();
    }  
    const [assignMenus, setAssignMenus] = useState(0);
    useEffect(() => {
        getMenuItems()
        getRoleDetails()          
      },[]);
      const permittedMenuItemActions = [];
      const permittedMenuItems = [];
      if(props.permission.length>0) {
        for(let i = 0; i < props.permission.length; i++ )
        {  
            permittedMenuItems.push(props.permission[i].menuItemId) ;      
          permittedMenuItemActions[props.permission[i].menuItemId] = parseInt(props.permission[i].hasOwnProperty('menuItemActions') ?(Array.isArray(props.permission[i].menuItemActions)?props.permission[i].menuItemActions.length : 0):0);
        }
      } 
   const menuActionsCount = [];
   let totalActionsCount = 0;
   let totalActionsGrantedCount = 0;
   const aa = props.menus.map((menu) => {       
        let actionsCount = 0;
        if(menu.hasOwnProperty('actions')) {
            actionsCount = menu.actions.length;
            totalActionsCount = parseInt(totalActionsCount) + parseInt(actionsCount);
        }
        menuActionsCount[menu.encrypted_id] = actionsCount;
        return menu;
    },menuActionsCount);
   
    const previousPermittedMenuItemsActions = [];
    if(props.roles[0].permissionData) {  

        Object.values(props.roles[0].permissionData.menuItemsActionsAssigned).map((permission) => {
            previousPermittedMenuItemsActions.push(permission.encryptedId);
            if(Array.isArray(permittedMenuItemActions)) {             
                if(permittedMenuItemActions[permission.encryptedId]>=0) { 
                    totalActionsGrantedCount = parseInt(totalActionsGrantedCount) + parseInt(permittedMenuItemActions[permission.encryptedId]);  
                } else {
                    totalActionsGrantedCount = parseInt(totalActionsGrantedCount) + parseInt(permission.actionsAssignedCount); 
                }
            } else {
                totalActionsGrantedCount = parseInt(totalActionsGrantedCount) + parseInt(permission.actionsAssignedCount); 
            }                                    
        })
      } 
      const newGrantedActionsAcount = permittedMenuItems.map((menuitemId) => {
        if(previousPermittedMenuItemsActions.indexOf(menuitemId)===-1) {
            totalActionsGrantedCount = parseInt(totalActionsGrantedCount) + parseInt(permittedMenuItemActions[menuitemId]); 
            return permittedMenuItemActions[menuitemId];
        }
      })
    const totalActionsDeniedCount = parseInt(totalActionsCount) - parseInt(totalActionsGrantedCount); 
    console.log(props.roles)
       return (
        <div>
                    
                {
                    props.roles.map((role) => {                                    
                        return <>
                        <div class="lp-heading "><div class="display-text"><p class="capitalize">{role.name}  - {role.departmentName} - Permission Control</p></div></div>
                        <div class="rolecard"><div class="round-disp"><img src="http://devapi.zaicrm.com/public/img/role_default.png" /></div><div class="rolecard-body"><div class="rolecard-title">Role: {role.name}</div><div class="rolecard-text"></div></div></div>
                        <div class="card pc-card m-3 border-0 shadow-none">
                        <div class="card-body">
                        <div class="d-flex justify-content-end mb-2">
                            <div class="capsule capsule-gray mr-1" id="gradeLevel">Grade level : {role.hierarchyName}</div>
                            <div class="capsule capsule-gray mr-1" id="reportingTo">Reporting to : <span>
                                { role.permissionData ?
                                role.permissionData.reportingToRoles.reportingToRoleNames: ''}
                                </span></div></div>
                            <div class="menuitems-actions">
                            <div class="card-header pc-header overview">
                            <div class="space-between">
                            <div class="vh-baseline">
                            <span class="mr-2">Menu access setting</span><div class="d-flex">
                            <div class="capsule mr-1">Menu Actions Denied: <span>{ totalActionsDeniedCount }</span></div>
                            <div class="capsule mr-1">Menu Actions Granted: <span>{ totalActionsGrantedCount }</span></div></div></div>
                            <div>
                                { assignMenus===0 ? ( 
                                <button class="btn btn-sm btn-dark menu-action editdone" id="assignmenus"  onClick={()=> { setAssignMenus(1) }}>
                            <span></span><span> Assign Menus</span></button>
                                ) : (
                            <button class="btn btn-sm btn-dark menu-action editdone" onClick={() => { storePermissions() }}>Done</button> 
                                )
                            }
                            
                            </div></div>
                            </div>
                            </div>

                        </div>
                        </div>  
                        { assignMenus===0 ? (                                 
                            <div>
                            <div class="card-body menu-acc1">
                            <div class="row">
                            <div class="col-md-9" id="menuaction">
                                { role.permissionData ? (                              
                                Object.values(role.permissionData.menuItemsActionsAssigned).map((permission) => {
                                                            
                                const actionsAssigned = Object.values(permission.actionsAssigned);                                                   
                                    return <span>
                                        <div class="ma-acc">
                                        <div class="ma-acc-pointer collapsed " data-toggle="collapse" data-target="#ma-body-1" aria-expanded="true" aria-controls="ma-body-1"><div class="space-between">
                                        <div class="vh-baseline"><span class="mr-2">{ permission.menuItemName }</span><div class="d-flex"><div class="capsule capsule-gray mr-1">DENIED : <span> { parseInt(menuActionsCount[permission.encryptedId]) -  parseInt(permission.actionsAssignedCount) } </span></div><div class="capsule capsule-gray mr-1">GRANTED : <span>{ permission.actionsAssignedCount } </span></div></div></div></div></div>
                                        </div>
                                    </span>                               
                                })

                                
                                ) : ( "" )
                                } 
                                { totalActionsGrantedCount==0 ? ( <div class="card-body menu-acc1"><div class="row"><div class="col-md-9" id="menuaction"><p class="no-menu-item">No Menus Assigned</p></div></div></div> ) : ("") }
                                </div></div></div>                             
                            </div>
                        ):(  <Assignmenu /> )
                    }
                        </>                        
                    })
                }      
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        token: state.login.token,
        roles: state.roles.roles,
        menus: state.menus.menuItemsActions,
        permission: state.permission.permittedMenuItemsActions
    }
}
const mapDispatchToProps = (dispatch) => {
    return {        
        GetAuthorizeToken: (tokenFromRs) => { dispatch({type:GETJWTTOKEN,token:tokenFromRs}) },
        GetRoles: (roles) => { dispatch({type:GETROLESLIST,roles:roles}) },
        GetRolesPermissions: (rolesPermissions) => { dispatch({type:GETROLESPERMISSIONS,rolesPermissions:rolesPermissions}) },
        clearPermissions: () => { dispatch({type:CLEARPERMISSIONS}) },        
        GetMenuItemsActions: (menuItemsActions) => { dispatch({type:GETMENUITEMSACTIONS,menuItemsActions:menuItemsActions})},
        getMenuItemsActionsAdditional: (menuItemsActionsAdditional) => { dispatch({type:GETMENUITEMSACTIONSADDITIONAL,menuItemsActionsAdditional:menuItemsActionsAdditional})}

    }
}
 export default connect(mapStateToProps,mapDispatchToProps)(LoginPage)
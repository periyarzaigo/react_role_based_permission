import React from 'react'
import {Provider, connect} from 'react-redux';
import store, {GETJWTTOKEN, GETROLESLIST, GETMENUITEMSACTIONS, UPDATEPERMISSIONS } from '../components/rolePermissionsStore';

const AssignMenuItemActions = (props) => {
  const updatePermissions = (permittedMenuItemActions, operation, roleDetails) => {
    props.updatePermissions(permittedMenuItemActions, operation, roleDetails);
  }
  const permittedMenuItems = [];
  const permittedMenuItemActions = [];
  const totGraActCntArr = [];
  if(props.permission.length>0) {
    for(let i = 0; i < props.permission.length; i++ )
    {
      //console.log("0. permission=  ");
     // console.log(props.permission[i])
      permittedMenuItems.push(props.permission[i].menuItemId)
      //console.log("1. Menu Item Id =  "+props.permission[i].menuItemId)
      //console.log( "2. "+props.permission[i].menuItemActions);
      if(Array.isArray(props.permission[i].menuItemActions)) {
        permittedMenuItemActions[props.permission[i].menuItemId] = [...props.permission[i].menuItemActions];
      } else {
        permittedMenuItemActions[props.permission[i].menuItemId] = [];
      }
      //console.log( "3. permittedMenuItemActions = ");
      //console.log( permittedMenuItemActions[props.permission[i].menuItemId]);
    }
  } else {
    console.log("No New Permissions Added or Updated")
  }
  if(props.roles[0].permissionData) {  

    Object.values(props.roles[0].permissionData.menuItemsActionsAssigned).map((permission) => {
       // console.log("Permitted Data==" + permission.encryptedId+" ==> "+permission.menuItemName);
       // console.log(permission)
        let totalActionsGrantedCount = 0;
        if(Array.isArray(permittedMenuItemActions)) {
           // console.log("===========Inside If permittedMenuItemActions=============")
           /*  let pMenuKeys = permittedMenuItemActions.keys();
           console.log("===========pMenuKeys===========")
            console.log(pMenuKeys)
              console.log("-----------Else actionsAssigned----------------------")
              console.log(permission.actionsAssigned)
              console.log("-----------Else Object Keys----------------------")
              console.log("================permittedMenuItems==========");
              console.log(permittedMenuItems);*/
              if(parseInt(permission.actionsAssignedCount) > 0  && permittedMenuItems.indexOf(permission.encryptedId) ===-1) {
                //console.log("==========Inside IF Menu Item Check=======")
                //console.log(Object.values(permission.actionsAssigned));
                const actAssigned =  Object.values(permission.actionsAssigned);
                const actAssignedIds = actAssigned.map((action) => {
                  return action.encryptedId;
                })
                permittedMenuItemActions[permission.encryptedId] = actAssignedIds;
                totalActionsGrantedCount =  parseInt(permission.actionsAssignedCount);  
              } else {
                totalActionsGrantedCount =  Array.isArray(permittedMenuItemActions[permission.encryptedId])?permittedMenuItemActions[permission.encryptedId].length:0; 
              }


        } else {
            totalActionsGrantedCount = parseInt(totalActionsGrantedCount) + parseInt(permission.actionsAssignedCount); 
        } 
        totGraActCntArr[permission.encryptedId] = totalActionsGrantedCount;
        //console.log(permission.encryptedId+ " ==> "+totalActionsGrantedCount);
        //console.log(permission)                                   
    },permittedMenuItemActions)
  } 
  /*console.log("===============totGraActCntArr=============")
  console.log(totGraActCntArr)
  console.log("=============== Updated permittedMenuItemActions=============")
  console.log(permittedMenuItemActions)*/
  return( 
  <Provider store={store}>     
  <table>   
    <tbody>
      {props.menus.length > 0 ? (
        props.menus.map((menu, key) => (
            <>
          <tr key={key}>
            <td>{menu.name}
           <div class="capsulea test capsule-gray mr-1 fright" >DENIED : <span>{ (menu.hasOwnProperty('actions') ? menu.actions.length : 0) - (permittedMenuItemActions[menu.encrypted_id] ? permittedMenuItemActions[menu.encrypted_id].length : 0 ) }</span></div>
            <div class="capsulea capsule-gray mr-1 fright">GRANTED : <span>{ permittedMenuItemActions[menu.encrypted_id] ? permittedMenuItemActions[menu.encrypted_id].length : 0 }</span></div>
           
            </td>            
            <td>
            { permittedMenuItems.indexOf(menu.encrypted_id) ===-1 ? (
              <button className="button muted-button" onClick={ ()=> updatePermissions({menuItemId:menu.encrypted_id, menuItemActions:[]},'addMenuItem',props.roles)}>+</button>  
            ) : (
              <button className='button muted-button" title="Click here to remove the {menu.name) from role based permission' onClick={ ()=> updatePermissions({menuItemId:menu.encrypted_id, menuItemActions:[]},'removeMenuItem', props.roles)}>-</button>
            )
            }
            </td>
          </tr>
          { permittedMenuItems.indexOf(menu.encrypted_id) !==-1 ? (
          <tr id="{menu.encrypted_id}" >
           <td colSpan="2">
          { menu.hasOwnProperty('actions') ? (
            menu.actions.map((action) => {
               return <div>
                 <input
                    type = "checkbox"
                   checked ={ permittedMenuItemActions[menu.encrypted_id].indexOf(action.encrypted_id)  ===-1 ? ( "" ):("checked")  }            
                    onClick={ ()=> updatePermissions({menuItemId:menu.encrypted_id, menuItemActions:[action.encrypted_id]}, permittedMenuItemActions[menu.encrypted_id].indexOf(action.encrypted_id)  ===-1 ? ( "addMenuItemAction" ):("removeMenuItemAction"),props.roles)}        
                  />                 
                 {action.name}
                 </div>
           })
       ):(
           <div class="text-center no-menu-actions ma-acc-body">No actions available under <span class="strong">{menu.name}</span> menu Item.</div>
        ) }</td>
        </tr> ) : null }
        </>

        ))
      ) : (
        <tr>
          <td colSpan={3}>No Menu items and actions</td>
        </tr>
      )}
    </tbody>
  </table>
  </Provider>
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
        GetMenuItemsActions: (menuItemsActions) => { dispatch({type:GETMENUITEMSACTIONS,menuItemsActions:menuItemsActions})},
        updatePermissions: (permittedMenuItemActions, operation, roleDetails) => { dispatch({type:UPDATEPERMISSIONS,payload:permittedMenuItemActions,operation:operation, roleDetails: roleDetails}) },
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(AssignMenuItemActions);
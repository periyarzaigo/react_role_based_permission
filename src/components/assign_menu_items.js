import React from 'react'
import {Provider, connect} from 'react-redux';
import store, {GETJWTTOKEN, GETROLESLIST, GETMENUITEMSACTIONS, UPDATEPERMISSIONS } from '../components/rolePermissionsStore';

const AssignMenuItems = (props) =>{
  const updatePermissions = (permittedMenuItemActionsL, operation, roleDetails) => {
    props.updatePermissions(permittedMenuItemActionsL, operation, roleDetails);
  }
  const permittedMenuItems = [];
  const permittedMenuItemActions = [];
  const overAllMenuItems = [];
  const overallMenuItemActions = [];
  let totalActions = 0;
  let grantedActions = 0;
  if(props.permission.length>0) {
    for(let i = 0; i < props.permission.length; i++ )
    {
      permittedMenuItems.push(props.permission[i].menuItemId)
      if(Array.isArray(props.permission[i].menuItemActions)) {
        permittedMenuItemActions[props.permission[i].menuItemId] = [...props.permission[i].menuItemActions];
      } else {
        permittedMenuItemActions[props.permission[i].menuItemId] = [];
      }     
      grantedActions = parseInt(grantedActions) + parseInt(permittedMenuItemActions[props.permission[i].menuItemId].length);
    }
  }
  if(props.menus.length>0) {
    for(let j = 0; j < props.menus.length; j++ )
    {
      overAllMenuItems.push(props.menus[j].encrypted_id)    
     overallMenuItemActions[props.menus[j].encrypted_id] =   (props.menus[j].hasOwnProperty('actions') ? [...props.menus[j].actions] : []);
     totalActions = parseInt(totalActions) + parseInt(props.menus[j].hasOwnProperty('actions') ? props.menus[j].actions.length : 0);
    }
  }
 
return (
  <Provider store={store}>  
  <table>   
    <tbody>
      {props.menus.length > 0 ? (
        props.menus.map((menu, key) => (           
          <tr key={key}>
            <td><input
            type = "checkbox"
            class="custom-control-input"
            checked={permittedMenuItems.indexOf(menu.encrypted_id) !==-1 ? ( "checked" ):  ("") }
            onClick={ ()=> updatePermissions({menuItemId:menu.encrypted_id, menuItemActions:[]},permittedMenuItems.indexOf(menu.encrypted_id) ===-1 ? ( "addMenuItem" ):  ("removeMenuItem"),props.roles)}        
            /><span class="mark">{menu.name}</span></td>            
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={3}>No Menu Items</td>
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
      updatePermissions: (permittedMenuItemActions, operation, roleDetails) => { dispatch({type:UPDATEPERMISSIONS,payload:permittedMenuItemActions,operation:operation, roleDetails}) },
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(AssignMenuItems);

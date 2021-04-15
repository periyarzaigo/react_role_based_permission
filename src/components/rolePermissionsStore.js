import * as redux from 'redux';
export const GETROLESLIST = 'getRolesList';
export const GETROLESPERMISSIONS = 'getRolesPermissions';
export const GETJWTTOKEN = 'getJWTToken';
export const GETMENUITEMSACTIONS = 'getMenuItemsActions';
export const GETMENUITEMSACTIONSADDITIONAL = 'getMenuItemsActionsAdditional';
export const GETPERMISSIONSGIVENARRAY = 'getPermissionsGivenArray';
export const UPDATEPERMISSIONS = 'updatePermissions';
export const CLEARPERMISSIONS = 'clearPermissions';
const initialRolesList = { roles: [ {name:'Static Dummy Role'}, {name:'ABC'}]
}
const initialTokenDetails = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9kZXZhcGkuemFpY3JtLmNvbVwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTYxODA5MjM3NCwiZXhwIjoxNjE4Njk3MTc0LCJuYmYiOjE2MTgwOTIzNzQsImp0aSI6Ilp1RmFGdFEyUUJ2bVkzd2ciLCJzdWIiOjEsInBydiI6ImZhY2U2MzM5MGM3NmZlMDIwYWI1MjRhNGIzNDMyYjQwMzU4ZWU3ZTIiLCJpc1N1cGVyQWRtaW5Mb2dnZWRJbiI6dHJ1ZSwiZGVzY2VuZGFudFJvbGVVc2VycyI6W119.suT84Y1_HZnrJjCvoqiNoE3GAvaMosw08SOgB7SPz5c' }
const rolesReducer = (state = initialRolesList, action )=> {
    switch(action.type) {
        case "getRolesList":             
            return {
                roles: [...action.roles]
            } 
        case "getRolesPermissions":
        {           
            const roles = [...state.roles];           
            if(roles.length > 0) {
                for(let rlv = 0 ; rlv < roles.length; rlv++) {                  
                    if(roles[rlv].encrypted_id===action.rolesPermissions.encryptedId) {
                        roles[rlv].permissionData = action.rolesPermissions;
                    }
                }
            }
            return {
                roles: [...roles]
            }                 
        }             
        default:
            {
                return state;
            }

    }
} 
const loginReducer = (state = initialTokenDetails, action )=> {
    switch(action.type) {
        case "getJWTToken":              
                return {...state,token: action.token};               
        default:
            {
                return state;
            }

    }
} 
//const initialMenuItemsActions = { menuItemsActions: [{name:'Dashboard'}]}
const initialMenuItemsActions = { menuItemsActions: []}
const menuReducer = (state = initialMenuItemsActions, action )=> {
    switch(action.type) {
        case "getMenuItemsActions":           
            return {
                menuItemsActions: action.menuItemsActions
            } 
        case "getMenuItemsActionsAdditional":
            const menuItmesActions = [...state.menuItemsActions,...Object.values(action.menuItemsActionsAdditional)];           
                return {

                    menuItemsActions: [...state.menuItemsActions,...Object.values(action.menuItemsActionsAdditional)]
                }                    
        default:
            {
                return state;
            }

    }
}
const initialPermittedMenuItemsActions = { permittedMenuItemsActions: []}

const permissionReducer = (state = initialPermittedMenuItemsActions, action )=> {
    switch(action.type) {
        case "getMenuItemsActions":
        {
           return state;   
        }
        case "clearPermissions":
        {
           return { permittedMenuItemsActions: []};   
        }
        case "updatePermissions":
        {
           const per = [...state.permittedMenuItemsActions];         
           switch(action.operation) {
               case 'addMenuItem': 
               {
                    per.push(action.payload);
                    const roleDetails = action.roleDetails;
                    const permittedMenuItemsActions = [];
                    if(Array.isArray(roleDetails) && roleDetails.length > 0 ) {
                        if(roleDetails[0].hasOwnProperty("permissionData")){
                            const permissionData = roleDetails[0].permissionData;
                            if(permissionData.hasOwnProperty("menuItemsActionsAssigned")){ 
                                const menuItemsActionsAssigned = permissionData.menuItemsActionsAssigned;                             
                                const perObjValues = Object.values(menuItemsActionsAssigned);                              
                                if(perObjValues.length>0){
                                    for(let poi=0; poi < perObjValues.length; poi++) {
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
                    const updPer = per.map((perObj, key) => {
                        let menuItemActions = [];
                        console.log(" perObj.menuItemId "+perObj.menuItemId)
                        if(Array.isArray(permittedMenuItemsActions[perObj.menuItemId]) &&   permittedMenuItemsActions[perObj.menuItemId].length>0){  
                            console.log("Inside IF = ")
                            if(action.payload.menuItemId===perObj.menuItemId) {                         
                                menuItemActions = permittedMenuItemsActions[perObj.menuItemId];
                            } else {
                                menuItemActions = perObj.menuItemsActions;
                            }
                        } else {                            
                            if(Array.isArray(perObj.menuItemActions)) {                                
                             if(perObj.menuItemActions.length>0) {   
                                 menuItemActions = perObj.menuItemActions;
                             }                           
                            }
                        }
                        return {menuItemId:perObj.menuItemId, menuItemActions:menuItemActions }
                    },permittedMenuItemsActions);
                    console.log("======updPer when adding menu item========")
                    console.log(updPer)
                    return { permittedMenuItemsActions: updPer, };
               }
               case 'removeMenuItemAction': 
               {
                    const result = per.filter((perArr) => {
                        return perArr.menuItemId===action.payload.menuItemId                       
                     })
                     let menuActions = [];
                     if(result[0].menuItemActions && result[0].menuItemActions.length > 0) {
                        menuActions = [...result[0].menuItemActions];
                     }
                     const plmalength = action.payload.menuItemActions.length;
                     if(plmalength > 0 ) {
                         for(let apv=0 ; apv < plmalength; apv++) {
                             menuActions =  menuActions.filter((maction) =>  {
                               return maction!==action.payload.menuItemActions[apv]
                             }
                                 );
                         }
                     }
                     const updatedMenuItemActionPerObj = {
                        menuItemId: action.payload.menuItemId,
                        menuItemActions: menuActions
                     }
                     const updatedPermissionObject = per.map((menu) => (menu.menuItemId === action.payload.menuItemId ? updatedMenuItemActionPerObj : menu));
                     console.log("======updPer when removeMenuItemAction========")
                     console.log(updatedPermissionObject)
                    return { permittedMenuItemsActions: updatedPermissionObject };
               }
               case 'addMenuItemAction': 
               {
                     const result = per.filter((perArr) => {
                        return perArr.menuItemId===action.payload.menuItemId                       
                     })
                     let menuActions = [];
                     if(result[0].menuItemActions && result[0].menuItemActions.length > 0) {
                        menuActions = [...result[0].menuItemActions];
                     }
                     const plmalength = action.payload.menuItemActions.length;
                     if(plmalength > 0 ) {
                         for(let apv =0 ; apv < plmalength; apv++) {
                            menuActions.push(action.payload.menuItemActions[apv]);
                         }
                     }
                     const updatedMenuItemActionPerObj = {
                        menuItemId: action.payload.menuItemId,
                        menuItemActions: menuActions
                     }
                     const updatedPermissionObject = per.map((menu) => (menu.menuItemId === action.payload.menuItemId ? updatedMenuItemActionPerObj : menu));
                     console.log("======updPer when addMenuItemAction========")
                     console.log(updatedPermissionObject)
                     return { permittedMenuItemsActions: updatedPermissionObject };
               }
               case 'removeMenuItem': 
               {                 
                   const result = per.filter((perArr) => {
                         return perArr.menuItemId!==action.payload.menuItemId                       
                    }) 
                    console.log("======updPer when removeMenuItem========")
                     console.log(result)             
                    return { permittedMenuItemsActions: [...result] };
               }
               default:
                   {
                       return state;
                   }
           }            
        }              
        default:
            {
                return state;
            }

    }
}
const rootReducer = (state = {}, action) => {
    return {
    roles: rolesReducer(state.roles, action),
    login: loginReducer(state.login,action),
    menus: menuReducer(state.menus, action),
    permission: permissionReducer(state.permission, action)
    }
}
//const store = redux.createStore(rolesReducer);
const store = redux.createStore(rootReducer);
//store.dispatch({type:GETROLESLIST});
export default store;
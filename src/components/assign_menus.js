import React from'react';
import AssignMenuItemActions from '../components/assign_menu_item_actions';
import AssignMenuItems from '../components/assign_menu_items';
const Assignmenu = () => {
    return (
<div className="container">
  
<div className="flex-row">
  <div className="flex-large">   
    <AssignMenuItems />
  </div>
  <div className="flex-large">    
    <AssignMenuItemActions />
  </div>
</div>
</div>
    )
}
export default Assignmenu;
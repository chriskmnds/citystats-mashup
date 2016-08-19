// A factory method defining global group/entity variables and methods
function Workgroup() {
  'use strict';

  var add = function(array, element) {
    array.pushIfNotExist(element, function(e) {
      return e === element;
    });
  };

  var remove = function(array, element) {
    var index = arrayIndexOf(array, element);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  var find = function(array, id) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i].id === id) return array[i];
    }
    return null;
  };

  var groupCount = 0;

  return {

    maxGroupsActive: 5,

    Entity: function(id, group) {
      this.id = id;
      this.group = group;
      this.groupOwner = true;
    },

    Group: function() {
      groupCount += 1;
      this.id = groupCount;
      this.entities = [];
      this.add = function(entity) {
        add(this.entities, entity);
      };
      this.remove = function(entity) {
        remove(this.entities, entity);
      };
    },

    entities: {
      entities: [],
      find: function(id) {
        return find(this.entities, id);
      },
      add: function(entity) {
        add(this.entities, entity);
      },
      remove: function(entity) {
        remove(this.entities, entity);
      }
    },

    groupsActive: {
      groups: [],
      find: function(id) {
        return find(this.groups, id);
      },
      add: function(group) {
        add(this.groups, group);
      },
      remove: function(group) {
        remove(this.groups, group);
      }
    },

    activateEntity: function(entityID) {
      var entity = this.entities.find(entityID);
      // TODO Test
      // If entity exists
      if (entity !== null) {
        // Activate enitty's group if active nodes < maxGroupsActive
        if (this.groupsActive.groups.length < this.maxGroupsActive) {
          this.groupsActive.add(entity.group);
          return true;
        }
      }
      return false;
    },

    deactivateEntity: function(entityID) {
      var entity = this.entities.find(entityID);
      // TODO Test
      // If entity exists
      if (entity !== null) {
        // Activate enitty's group if active nodes < maxGroupsActive
        this.groupsActive.remove(entity.group);
        return true;
      }
      return false;
    },

    groupWithActiveEntity: function(entityAID, entityBID) {

      /*  Assign entityA to entityB's group
        EntityB must be an active entity
      */

      // Retrieve entities from workgroup
      var entityA = this.entities.find(entityAID),
        entityB = this.entities.find(entityBID);

      // TODO TEST
      // If entities exist:
      if (entityA !== null && entityB !== null) {

        // TODO TEST
        // If entityB is active:
        if (this.groupsActive.find(entityB.group.id) !== null) {

          // TODO TEST
          // If entityA's group contains only 1 entity || entityA is NOT a group owner
          if (entityA.group.entities.length === 1 || entityA.groupOwner !== true) {

            // Buffer the entities' original groups and ownership to fallback in case of error
            var groupA = { group: entityA.group,
                     flag: entityA.groupOwner,
                     active: this.groupsActive.find(entityA.group.id) };
            var groupB = { group: entityB.group,
                     flag: entityB.groupOwner };

            try {
              // Step 1: Deactivate entityA's group
              this.groupsActive.remove(entityA.group);
              // Step 2: Remove entityA from its group
              entityA.group.remove(entityA);
              entityA.groupOwner = false;
              // Step 3: Add entityA to entityB's group
              entityA.group = entityB.group;
              entityB.group.add(entityA);
            } catch (err) {
              // Reverse Step 1
              if (groupA.active) {
                this.groupsActive.add(entityA.group);
              }
              // Reverse Steps 2 & 3
              groupA.group.add(entityA);
              entityA.group = groupA.group;
              entityA.groupOwner = groupA.flag;
              entityB.group.remove(entityA);
              console.log('Cannot group with Entity ' + entityB.id);
              console.log(err.message);
              return false;
            }
          } else {
            console.log('Entity ' + entityA.id + ' is group owner and connected to other entities');
            return false;
          }
        } else {
          console.log('Cannot group with Entity ' + entityB.id);
          return false;
        }
      } else {
        console.log('Entities not found');
        return false;
      }
      return true;
    },

    removeFromGroup: function(groupID, entityID, activate) {

      /*  Remove entity from group if not group owner
        Assign new group to entity
        Set new group as active if 'activate === true'
      */

      // Retrieve entity from workgroup
      var entity = this.entities.find(entityID);
      // Buffer entity's original group for fallback in case of error
      var groupOld = { group: entity.group, flag: entity.groupOwner };

      // TODO TEST
      // If entity exists:
      if (entity !== null) {

        // TODO TEST
        // If not group owner:
        if (entity.groupOwner !== true) {

          var group = entity.group;

          // TODO TEST
          // If group exists:
          if (group.id === groupID) {

            // Create a new group here (to call in fallback if needed)
            var newGroup = new this.Group();

            try {
              // Step 1: Remove entity from group
              group.remove(entity);
              // Step 2: Associate entity with newGroup
              newGroup.add(entity);
              entity.group = newGroup;
              entity.groupOwner = true;
              if (activate) {
                this.activateEntity(entity.id);
              }
            } catch (err) {
              // Reverse Steps 1 & 2
              entity.group = group;
              group.add(entity);
              entity.groupOwner = groupOld.flag;
              this.groupsActive.remove(newGroup);
              console.log('Error removing entity form group.');
              console.log(err.message);
              return false;
            }
          } else {
            console.log('No such group');
            return false;
          }
        } else {
          console.log('Cannot remove group owner from group');
          return false;
        }
      } else {
        console.log('Entity not found');
        return false;
      }
      return true;
    },

    removeEntity: function(entityID) {
      // Retrieve entity from workgroup
      var entity = this.entities.find(entityID);
      // TODO TEST
      // If entity exists
      if (entity !== null) {
        if (entity.groupOwner) {
          // Assign new group to all entities associated with entity's group
          // Do not activate their groups
          for (var i = 0, len = entity.group.entities.length; i < len; i++) {
            var linkedEntity = entity.group.entities[i];
            // Can instead start loop at i = 1, since group owner is always the first in entities array.
            if (linkedEntity.id !== entity.id) {
              // Create new group
              var group = new this.Group();
              // Assign new group to entity
              linkedEntity.group = group;
              // Add entity to new group
              group.add(linkedEntity);
              // Set entity as owner
              linkedEntity.groupOwner = true;
            }
          }
          // Remove group from active groups
          this.groupsActive.remove(entity.group);
          // Remove entity from group
          entity.group.remove(entity);
          // Remove entity from entities array
          this.entities.remove(entity);
          // Remove node from graph
          //ForceGraphVoronoi.utils.removeNode(srv.forceGraph, entity.id);
          return true;
        } else {
          // Remove entity from group
          entity.group.remove(entity);
          // Remove entity from entities array
          this.entities.remove(entity);
          // Remove node from graph
          //ForceGraphVoronoi.utils.removeNode(srv.forceGraph, entity.id);
          return true;
        }
      }
      return false;
    }
  };
}

//Workgroup.$inject = [];
angular.module('myapp').factory('Workgroup', Workgroup);


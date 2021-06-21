import * as Twitter from 'twitter'
import config from './config'

export default {
  addMembersToList: function (listName, ownerScreenName, membersToAdd, callback) {
    const postParams = {
      slug: listName,
      owner_screen_name: ownerScreenName,
      screen_name: membersToAdd,
    }

    const client = new Twitter(config.auth.twitter)
    client.post('lists/members/create_all', postParams, function (err, listDetails, response) {
      if (err) {
        return callback && callback(err)
      }
      console.log('Succesfully added ' + listDetails.member_count + ' members to ' + listName)

      return callback && callback()
    })
  },
  getMembers: function (listName, ownerScreenName, numUsers, callback) {
    const getParams = {
      slug: listName,
      owner_screen_name: ownerScreenName,
      count: numUsers,
      include_entities: false,
    }

    const client = new Twitter(config.auth.twitter)
    client.get('lists/members', getParams, function (err, members, response) {
      if (err) {
        return callback && callback(err)
      }

      const listMemberHandles: string[] = []
      for (const i in members.users) {
        const member = members.users[i]
        listMemberHandles.push(member.screen_name)
      }

      return callback && callback(null, listMemberHandles)
    })
  },
}

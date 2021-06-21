import config from './config'
import * as fs from 'fs'
import * as parse from 'csv-parse'
import async from 'async'
import list from './list'

const inputFile = 'members.csv'
const asyncTasks: Function[] = []

const parser = parse({ delimiter: ',' }, function (err, data) {
  const membersToAdd = data[0].filter((member) => member.length)

  const numMembers = membersToAdd.length
  if (numMembers > 5000) {
    console.log('A maximum of 5000 members can be added to a list. Please reduce the number of members and try again.')
    return false
  }

  const allMembers = membersToAdd.slice(0).map(function (handle) {
    return handle.replace('@', '').trim()
  })

  const membersToAddArr: string[] = []
  while (membersToAdd.length) {
    const members = membersToAdd
      .splice(0, 51)
      .map(function (handle) {
        return handle.replace('@', '').trim()
      })
      .join(',')
    membersToAddArr.push(members)
  }

  membersToAddArr.forEach(function (members) {
    asyncTasks.push((callback) => {
      setTimeout(function () {
        const membersAdded = function (err) {
          if (err) {
            return callback && callback(err)
          }
          return callback && callback()
        }
        list.addMembersToList(config.userDetails.listName, config.userDetails.yourHandle, members, membersAdded)
      }, 5000)
    })
  })

  async.series(asyncTasks, function (err) {
    if (err) {
      console.log(err)
      return false
    }

    /**
     * Fetching users that have been added to the list, to check if any users weren't added.
     * Outputs the left-out users to console.
     **/

    const membersFetched = function (err, memberHandles) {
      if (err) {
        console.log(err)
        return false
      }

      const omittedUsers = allMembers.filter((x) => memberHandles.indexOf(x) < 0)
      console.log(
        "The following users weren't added to the list, as they were protected accounts, or invalid ones. :(  "
      )
      for (const i in omittedUsers) {
        console.log('https://twitter.com/' + omittedUsers[i])
      }
      return
    }

    list.getMembers(config.userDetails.listName, config.userDetails.yourHandle, numMembers, membersFetched)
  })
})

fs.createReadStream(inputFile).pipe(parser)

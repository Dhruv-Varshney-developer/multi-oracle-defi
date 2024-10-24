# Recommended practises for collaborative code development on GitHub:

- Ideally, main branch should contain the final, tried and tested, bug free code.
- Create a branch with your feature and first name and push all your code there. (Eg. Oracle-Dhruv would be the branch name for first task.)
- Code, debug, resolve, etc. on this branch.
- When your development branch is bug free, and tried and tested, commit your changes. Create a PR. Pull changes from remote to the master branch. Then merge the master and your development branch.
- Try to make regular, small commits to your development branch. That helps in fixing issues, if they arise.
- In the merging process, all the conflicts should be resolved correctly. If you have any issues with which version of code is correct, consult the person who did the latest commit on the master branch. Only after the conflicts are resolved, commit your changes and push it to the remote master branch.
- Use amoy testnet for deployment of contracts. You may use hardhat or remix, whichever feels easier to you.
- The hardhat directory consists of all smart contracts used in the dAPP
- The frontend directory consists of the entire react frontend.
- Use yarn instead of npm. npm causes dependencies conflict.

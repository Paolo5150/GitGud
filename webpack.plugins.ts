import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: 'src/dialogs/commitDialog.html', to: 'dialogs' }, 
      { from: 'src/dialogs/commitDialog.css', to: 'dialogs' }, 
      { from: 'src/dialogs/setOrigin.html', to: 'dialogs' }, 
      { from: 'src/dialogs/branches.html', to: 'dialogs' }, 
      { from: 'src/dialogs/branches.css', to: 'dialogs' }, 
      { from: 'src/dialogs/createBranchDialog.html', to: 'dialogs' }, 

    ],
  })
];

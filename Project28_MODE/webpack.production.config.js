const pathM = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
/* const { CleanWebpackPlugin } = require('clean-webpack-plugin');
 */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { getCompilerHooks } = require('webpack-manifest-plugin');
let productsJSON={};

/* HtmlWebpackPlugin.prototype.apply = function(compiler){
   const { afterEmit } = getCompilerHooks(compiler);
  
      afterEmit.tap('HtmlWebpackPlugin', (manifest) => {
         productsJSON = require('./assets/img/manifest.json');

         console.log("\n\nSONO QUA\n\n",productsJSON)
})
} */


/* try {
   productsJSON = require('./assets/img/manifest.json');
}
catch (err) {
   console.log(`Alla prima esecuzione il file manifest.json non esiste. Fare il build
                due volte. Sarebbe meglio gestirlo in un altro modo. Ma non so
                temporizzare l'esecuzione dei plugin. Cioè HTMLWebPackPlugin andrebbe
                eseguito solo dopo che ManifestPlugin ha creato Manifest.json `)
} */

module.exports = {
   entry: './src/js/index.js',
   output: {
      filename: 'js/bundle.[contenthash].js',
      path: pathM.resolve(__dirname, './dist'),
      assetModuleFilename: '[path][name].[contenthash][ext]', 
      publicPath: './',
      clean: true /* {
         dry: false,
         keep:/\.css$/ 
      } */   //Serve per cancellare la cartella dist dalla precedente esecuzione
   },
   mode: 'production',
   module: {
      rules:[
         {
            test: /\.(png|jpe?g|webp|avif|gif|svg)$/,
            type: 'asset',
            parser: {
               dataUrlCondition: {
                  maxSize: 3 * 1024 //3 Kilobytes QUI CAMBIA LA SOGLIA A 3 KByte
                 /*  Il logo Angular è 6, 5 Kbyte.Cambia la soglia per includere
                  nel bundle js il logo */
               }
            }
         },
         /*rules per quando provi ad importare un file css da javascript. Uso due loaders
         css-loader  legge il contenuto del css e ritorna il contenuto
         style-loader prende il css e lo mette nella pagina, mette il css proprio nel
                      bundle.js Poi vedremo come generarli come file separati
         */
         {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader,'css-loader'] 
         },
         {
            test: /\.scss$/,
            use: [MiniCssExtractPlugin.loader,'css-loader','sass-loader'] 
         },
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: [['@babel/env', {
                      targets: "> 0.1%, not dead",
                     debug:true, 
                     useBuiltIns: 'usage',
                     //Puoi mettere anche solo version:3
                     //La versione la puoi prelevare da package.json
                     corejs:{version:3.26 , proposals:true}
                  }]],
                  //plugins: ['@babel/plugin-proposal-class-properties']
               }
            }
         }
      ]
   },
   plugins: [
       new CopyWebpackPlugin({
         patterns: [
             {
                from: './assets/img', to: './assets/img/[name].[contenthash][ext]',
                globOptions: {
            ignore: [
              // Ignore all `txt` files
              "**/*.json",
            ],
          }, },
            
          ],
          options: {
        concurrency: 100,
          },
          
       }),
      new WebpackManifestPlugin({
         generate(seed, files, entrypoints) {
            const manifestJson = files.reduce(
              (manifest, file) => Object.assign(manifest, { [file.name]: file.path }),
              seed
            );
            // 👇 here's the magic,
            // I just hijack the result right inside JS
            // so we don't need to wait for it to be written to disk
            // Then just Object.assign it onto productsJson
            Object.assign(productsJSON, manifestJson);
            console.log('tada!', productsJSON);
            return manifestJson;
      }
         //}
                //Percorso assoluto che serve per dire dove mettere il file manifest.json
                //fileName: pathM.resolve(__dirname, 'assets/img/manifest.json'),
         /* publicPath: '/dist/' QUesto metterebbe /dist/ prima del percorso di sopra*/
                /* filter: (file) => { const regEx = /img/;
                                    return regEx.test(file.name); */
      ,/*map: (file) => {
                    if ('production' === env.NODE_ENV) {
                        // Remove hash in manifest key
                        file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
                    }
                    return file;
                },*/
               /*  apply(webpackCompiler){
                  
                  webpackCompiler.hooks.done.tap('DonePlugin', (stats) => {
                     
                     productsJSON = require('./assets/img/manifest.json');
                     console.log("\n\nMANIFEST HERE:\n\n",productsJSON);
                     
                   })}
            }, */
            
         }),
      new MiniCssExtractPlugin({
      filename:"css/main.[contenthash].css"
      }),
      new HtmlWebpackPlugin({
        
         inject: false,
         template: "./index.ejs", //Puoi mettere anche un file html
         templateParameters: {
            'myJSON': productsJSON
         },
         minify:true ,
         
        
      }),
      /* {
      apply(webpackCompiler){
                  
         webpackCompiler.hooks.done.tap('DonePlugin', (stats) => {
            
            productsJSON = require('./assets/img/manifest.json');
            console.log("\n\nMANIFEST HERE:\n\n",productsJSON);
            
          })}
         } */
      /*Nella seguente configurazione di questo plugin eliminiamo tutti i file
      e le cartelle e sottocartelle a partire dalla cartella .dist che è quella
      specificata in ouput.path
      asteriscoasterisco/asterisco  vuol dire tutti i file e le sottocartelle
      Inoltre specifico di ripulire anche tutti i file e le sottocartelle 
      dentro la cartella nomeCartella
      Nota che devo fornire un percorso assoluto perchè di default parte
      da ./dist (impostata in output.path)
      */
      //new CleanWebpackPlugin({
        // cleanOnceBeforeBuildPatterns: [
          //  '**/*',
           // path.join(process.cwd(),'nomeCartella/**/*')
      //]
   //})
   ]

}



process.on('exit', function () {
   console.log('__TEST__ on process exit');
});
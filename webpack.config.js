const path=require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin}=require('clean-webpack-plugin');
const webpack=require('webpack');
const configs={
	mode:'development',
	devtool:'cheap-module-eval-source-map',
	entry:{
		order_confirm:'./src/js/index.js'
	},
	output:{
		filename:'js/[name].js',
		path:path.resolve(__dirname,'./dist'),
		chunkFilename:'js/chunk_[name].js'
	},
	externals:{
		'Vue':'Vue',
		'jquery':'jQuery',
		'jquery':'$',
	},
	devServer:{
		contentBase:path.resolve(__dirname,'./dist'),
		port:8848
	},
	module:{
		rules:[{
			test:/\.js$/,
			exclude:[/node_modules/,path.resolve(__dirname,'./src/assets')],
			loader:'babel-loader',
			options:{
				 presets:[
					 [
					 '@babel/preset-env',{
						 useBuiltIns:'usage',
						 corejs:2
					 }
					]
				]
			}
		},{
			test:/\.(jpg|png|gif)$/i,
			use:{
				loader:'file-loader',
				options:{
					name:'[name].[ext]',
					outputPath:'images/'
				}
			}
		},{
			test:/\.css$/,
			use:['style-loader','css-loader']
		},{
			test:/\.less$/,
			use:[{
				loader:'style-loader'
			},{
				loader:'css-loader'
			},{
				loader:'less-loader'
			}]
		},{
			test: /\.(eot|ttf|svg|woff)$/,
			use: {
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'images/'
				}
			}
		}]
	},
	plugins: [
		// new HtmlWebpackPlugin({
		// 	template: './src/index.html',
		// 	filename: 'index.html',
		// 	chunks: ['order_confirm']
		// }),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns:[
				path.resolve(__dirname,'./dist')
			]
		}),
		new webpack.ProvidePlugin({
			$:'jquery',
			Vue:'Vue'
		})
	]
};
const makeChunks=(configs)=>{
	let chunks=[];
	Object.keys(configs.entry).forEach(key=>{
		chunks.push(key);
	});
	configs.plugins.push(new HtmlWebpackPlugin({
		template: './src/index.html',
		filename: 'index.html',
		chunks
	}));
	return configs;
}
module.exports=makeChunks(configs);

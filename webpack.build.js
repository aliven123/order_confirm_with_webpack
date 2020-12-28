const path=require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack=require('webpack');
module.exports={
	mode:'production',
	devtool:'cheap-module-source-map',
	entry:{
		index:'./src/js/index.js'
	},
	output:{
		filename:'js/[name].js',
		path:path.resolve(__dirname,'./dist')
	},
	externals:{
		'Vue':'Vue',
		'jquery':'jQuery',
		'jquery':'$',
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
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			chunks: ['index']
		}),
		new webpack.ProvidePlugin({
			$:'jquery',
			Vue:'Vue'
		})
	]
}
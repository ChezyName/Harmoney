# Harmoney - **Gamers Heaven**
Harmoney is an app created by [@ChezyName](https://github.com/ChezyName), for the sole purpose of recreating discord in a likeable way. This app give the user full control over every aspect of the app, dislike it? make a spin off of the app with the [full source code available here.](https://github.com/ChezyName/Harmoney)
The full apps code is available, you just need to place in your firebase SDK information, there is a tutorial below for anyone who wants to create their own version of the app.
Customizability does not end there, we have worked hard on adding full Theme support. There are 4 built-in themes created by me, Dark - The normal theme for everyone whos normal, Light - 'Flashbang', Midnight / Moody Blues - think jazzzz, and Last but not least, ~~Google~~ I **MEAN** carrot, I don't have the rights for that 'word', anyways...
Carrot - idk I took ~~Google~~'s Colors. Harmony, give users full data privacy because its open-source, you can legit remove anything fishy yourself!

## Custom Themes
Custom themes are one of the greatest things to be added to Harmoney. the endless possibility to change anything you dislike of the color scheme without making the app using your own firebase SDK.

Either you can start from scratch or use the template below, id recommend using the template as in *Visual Studio Code* you can change the colors without knowing Hex Codes and gives a color picker option![VS Code Color Picker](https://mspoweruser.com/wp-content/uploads/2017/09/Screen-Shot-2017-09-07-at-18.41.20.png)

```
:root{

--backgroundPrimary: #222;

--backgroundSecondary: #333;

  

--text: #fff;

  

--outlines: #111;

  

--interactble: #444;

--interactbleHover: #556;

  

--topBarPrimary: #222;

--topBarSecondary: #333;

  

--topbarButtons: #111;

--topbarButtonsHover: #333;

  

--topbarCloseHover: #912;

  

--scrollMain: #334;

--scrollScnd: #112;

}
```
### Explanation Of The Variables For Custom Themes
```
backgroundPrimary: Used In All Apps, Color Of The Background
backgroundSecondary: Secondary Background Color

text: Color For All Text

outlines: Outline For Buttons Ect

interactble: Buttons Primary Color
interactbleHover: Buttons Hovering Color

topBarPrimary: Menu Bar Primary Color
topBarSecondary: Menu Bar Secondary Color

topbarButtons: Menu Bar Buttons Color
topbarButtonsHover: Menu Bar Buttons Color When Hovering

topbarCloseHover: Menu Bar Closing Button When Hovered

scrollMain: ScrollBar Main Color
scrollScnd: #ScrollBar Secondary Color
```

## Recreating Your Own 'Harmoney'
This option is for those who want to create their own, if its adding voice calling or modifying the text communication or adding your own sound effects, etc.
First is to download the whole app [source code from GitHub, from here.](https://github.com/ChezyName/Harmoney)
Then you click Code > Download as Zip. Extract to desktop and open your code editor of your choice and begin editing.
The Large File : Main.JS is the one where all the 'server' side code is handled and where the electron process lives. While the other js/css/html files inside src are for each separate webpage. preload.js is a file that keeps data secure using electrons [ipcMain and context Bridge, you can learn more here.](https://www.electronjs.org/docs/latest/tutorial/context-isolation) All you need for making your own Discord Clone, is to make an app on Firebase and get the SDK keys, located in project settings, scroll down where it says **NPM**, **CDN** and **Config**, paste the config keys into the Main.js on **Line 16**
```
const firebaseConfig =  {
	apiKey:  "",
	authDomain:  "",
	projectId:  "",
	storageBucket:  "",
	messagingSenderId:  "",
	appId:  "",
	measurementId:  ""
};
```
it should look something like this but with the pasted values implemented, after that its up to your imagination to bring Harmoney to life once more.

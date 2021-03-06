/*
 * shownotes
 *
 * Copyright 2013, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  https://github.com/SimonWaldherr/wp-osf-shownotes
 * Wordpress: http://wordpress.org/plugins/shownotes/
 * Version: 0.4.2
 */

/*jslint browser: true, indent: 2 */
/*global majaX, shownotesname, tinyosf, osfExportModules */


function importShownotes(textarea, importid, baseurl) {
  "use strict";
  var requrl;
  requrl = baseurl.replace("$$$", importid);
  majaX({url: requrl}, function (resp) {
    textarea.value = resp.trim();
    analyzeShownotes();
  });
}

function getPadList(select, podcastname) {
  "use strict";
  var requrl,
    padslist,
    returnstring = '',
    i;

  if (podcastname.trim() === "*") {
    requrl = 'http://cdn.simon.waldherr.eu/projects/showpad-api/getList/';
  } else {
    requrl = 'http://cdn.simon.waldherr.eu/projects/showpad-api/getList/?search=' + podcastname.trim();
  }

  majaX({url: requrl, type: 'json'}, function (resp) {
    padslist = resp;
    for (i = 0; i < padslist.length; i += 1) {
      if (shownotesname === padslist[i].docname) {
        returnstring += '<option selected>' + padslist[i].docname + '</option>';
      } else {
        returnstring += '<option>' + padslist[i].docname + '</option>';
      }
    }
    select.innerHTML = returnstring;
  });
}

function analyzeShownotes() {
  "use strict";
  var textarea = document.getElementById('shownotes'),
    shownotes = textarea.value,
    ready = false,
    header = false,
    compatible = false,
    podcast = false,
    episode = false,
    title = false,
    chapters = 0,
    revision = 0,
    helper;
  helper = shownotes.split(/[\\\/]head(er)?/gmi)[0].trim();
  revision = shownotes.match(/( \#r | \#revision | \#r\n| \#revision\n)/gmi);
  revision = (revision === null) ? 0 : revision.length;
  ready = /\n *ready: ?(false|no|not|nicht)/gmi.test(helper) ? false : (revision > 0) ? false : true;
  podcast = /\n *podcast: ?\w{3,}/gmi.test(helper);
  episode = /\n *episode: ?\d+/gmi.test(helper);
  title = /\n *(episode)?tit(le|el): *[\w\d ]{5,}/gmi.test(helper);

  header = (helper.length > 23) ? podcast ? episode ? title : false : false : false;
  chapters = tinyosf.Export(tinyosf.Parser(tinyosf.htmldecode(shownotes)), osfExportModules.chapter).split("\n").length;
  compatible = (chapters > 3) ? true : (tinyosf.Parser(tinyosf.htmldecode(shownotes)).length > 23) ? true : false;
  document.getElementById('snstatus').innerHTML = '<b>Status: </b><span title="length: ' + helper.length + '\npodcast: ' + podcast + '\nepisode: ' + episode + '\ntitle: ' + title + '" style="color:' + ((header === true) ? 'green' : 'red') + ';">header</span>, ' + '<span title="count: ' + chapters + '" style="color:' + ((chapters > 3) ? 'green' : 'red') + ';">chapters</span>, ' + '<span style="color:' + ((compatible === true) ? 'green' : 'red') + ';">compatible</span>, ' + '<span title="revision items: ' + revision + '" style="color:' + ((ready === true) ? 'green' : 'red') + ';">ready</span>';
}

function templateAssociated(change) {
  "use strict";
  var delimiterele, lastdelimiterele;
  delimiterele = document.getElementById('main_delimiter');
  lastdelimiterele = document.getElementById('main_last_delimiter');
  document.getElementById('main_md_shortcode').parentNode.parentNode.style.display = 'none';
  if (document.getElementById('main_mode').value === 'block style') {
    delimiterele.parentNode.parentNode.style.display = 'table-row';
    lastdelimiterele.parentNode.parentNode.style.display = 'table-row';
  } else if (document.getElementById('main_mode').value === 'button style') {
    delimiterele.parentNode.parentNode.style.display = 'none';
    lastdelimiterele.parentNode.parentNode.style.display = 'none';
  } else {
    delimiterele.parentNode.parentNode.style.display = 'none';
    lastdelimiterele.parentNode.parentNode.style.display = 'none';
  }
  if (change === 1) {
    if (document.getElementById('main_mode').value === 'button style') {
      document.getElementById('css_id').value = 3;
    }
  }
}

function previewPopup(shownotesElement, emode, forceDL, apiurl) {
  "use strict";
  var preview = 'true',
    shownotesPopup;

  if (forceDL === true) {
    forceDL = 'true';
    preview = 'false';
  }
  if (emode === "audacity" || emode === "reaper") {
    shownotesPopup = window.open('', "Shownotes Preview", "width=1024,height=768,resizable=yes");
    shownotesPopup.document.write('<div style="white-space:pre;word-wrap:break-word;">' + tinyosf.Export(tinyosf.Parser(tinyosf.htmldecode(shownotesElement.value)), osfExportModules[emode]) + '</div>');
    shownotesPopup.document.title = 'Shownotes Preview';
    shownotesPopup.focus();
    return false;
  }
  majaX({url: apiurl + '/api.php', method: 'POST', data: {'fdl': forceDL, 'mode': emode, 'preview': preview, 'shownotes': encodeURIComponent(shownotesElement.value)}}, function (resp) {
    if (forceDL !== 'true') {
      shownotesPopup = window.open('', "Shownotes Preview", "width=1024,height=768,resizable=yes");
      shownotesPopup.document.write(resp);
      shownotesPopup.document.title = 'Shownotes Preview';
      shownotesPopup.focus();
    } else {
      window.location = apiurl + '/api.php?fdlid=' + resp + '&fdname=' + document.getElementById('title').value;
    }
  });
  return false;
}

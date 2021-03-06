var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
    
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  // #1
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    // #2
    formats: [ 'mp3' ],
    preload: true
  });
  
  setVolume(currentVolume);
};

var seek = function() {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]')
};

var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + songLength + '</td>'
    + '</tr>'
    ;

  var $row = $(template);
  
  var clickHandler = function() {
	var songNumber = parseInt($(this).attr('data-song-number'));

	if (currentlyPlayingSongNumber !== null) {
		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      // Revert to song number for currently playing song because user started playing new song.
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
	}
	if (currentlyPlayingSongNumber !== songNumber) {
      // Switch from Play -> Pause button to indicate new song is playing.
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      
      var $volumeFill = $('.volume .fill');
      var $volumeThumb = $('.volume .thumb');
      $volumeFill.width(currentVolume + '%');
      $volumeThumb.css({left: currentVolume + '%'});
      
      $(this).html(pauseButtonTemplate);
      updatePlayerBarSong();
	} else if (currentlyPlayingSongNumber === songNumber) {
      // Switch from Pause -> Play button to pause currently playing song.
		$(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton)
		if (currentSoundFile.isPaused()) {
          currentSoundFile.play();
          $(this).html(pauseButtonTemplate);
        } else {
          currentSoundFile.pause();
          setSong(songNumber);
        }
	}
  };
  
  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(playButtonTemplate);
    }
  };
  
  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));

    if (songNumber !== currentlyPlayingSongNumber) {
        songNumberCell.html(songNumber);
    }
  };
  
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    // #10
    currentSoundFile.bind('timeupdate', function(event) {
      // #11
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  // #1
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);
  
  // #2
  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  // #6
  var $seekBars = $('.player-bar .seek-bar');
  
  $seekBars.click(function(event) {
    // #3
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    // #4
    var seekBarFillRatio = offsetX / barWidth;
    
     if ($(this).parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
        setVolume(seekBarFillRatio * 100);   
      }
    // #5
    updateSeekPercentage($(this), seekBarFillRatio);
  });
    // #7
    $seekBars.find('.thumb').mousedown(function(event) {
      // #8
      var $seekBar = $(this).parent();

      // #9
      $(document).bind('mousemove.thumb', function(event) {
        var offsetX = event.pageX - $seekBar.offset().left;
        var barWidth = $seekBar.width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($seekBar.parent().attr('class') == 'seek-control') {
          seek(seekBarFillRatio * currentSoundFile.getDuration());   
        } else {
          setVolume(seekBarFillRatio);
        }
        
        updateSeekPercentage($seekBar, seekBarFillRatio);
      });

      // #10
      $(document).bind('mouseup.thumb', function(event) {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {

  var getLastSongNumber = function(index) {
    if (index == 0) {
      return currentAlbum.songs.length;
    } else {
      return index;
    }
  };
  // Use the trackIndex() helper function to get the index of the current song
  var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Increment the value of the index.
  currentIndex++;
  
  if (currentIndex >= currentAlbum.songs.length) {
    currentIndex = 0;
  }
  
  // Set a new current song to currentSongFromAlbum.
  setSong(currentIndex + 1);
  currentSoundFile.play();
  // Update the player bar to show the new song.
  updatePlayerBarSong();
  
  // Update the HTML of the previous song's .song-item-number element with a number.
  var lastSongNumber = getLastSongNumber(currentIndex);
  var lastPlayingCell = getSongNumberCell(lastSongNumber);
  var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

  // Update the HTML of the new song's .song-item-number element with a pause button.
  currentlyPlayingCell.html(pauseButtonTemplate);
  lastPlayingCell.html(lastSongNumber);
  
};

var previousSong = function() {
  
  var getLastSongNumber = function(index) {
    if (index == currentAlbum.songs.length - 1) {
      return 1;
    } else {
      return index + 2;
    }
  };
  // Use the trackIndex() helper function to get the index of the current song
  var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  // Increment the value of the index.
  currentIndex--;
  
  if (currentIndex < 0) {
    currentIndex = currentAlbum.songs.length - 1;
  }
  
  // Set a new current song to currentSongFromAlbum.
  setSong(currentIndex + 1);
  currentSoundFile.play();
  // Update the player bar to show the new song.
  updatePlayerBarSong();
  
  // Update the HTML of the previous song's .song-item-number element with a number.
  var lastSongNumber = getLastSongNumber(currentIndex);
  var lastPlayingCell = getSongNumberCell(lastSongNumber);
  var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

  // Update the HTML of the new song's .song-item-number element with a pause button.
  currentlyPlayingCell.html(pauseButtonTemplate);
  lastPlayingCell.html(lastSongNumber);
  
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
// #1
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $nextButton.click(nextSong);
  $previousButton.click(previousSong);
});

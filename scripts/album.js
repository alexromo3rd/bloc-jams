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
	var songNumber = $(this).attr('data-song-number');

	if (currentlyPlayingSongNumber !== null) {
		var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
      // Revert to song number for currently playing song because user started playing new song.
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
	}
	if (currentlyPlayingSongNumber !== songNumber) {
      // Switch from Play -> Pause button to indicate new song is playing.
		$(this).html(pauseButtonTemplate);
		currentlyPlayingSongNumber = songNumber;
        currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
        updatePlayerBarSong();
	} else if (currentlyPlayingSongNumber === songNumber) {
      // Switch from Pause -> Play button to pause currently playing song.
		$(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton)
		currentlyPlayingSongNumber = null;
        currentSongFromAlbum = null;
	}
  };
  
  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = songNumberCell.attr('data-song-number');

    if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(playButtonTemplate);
    }
  };
  
  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = songNumberCell.attr('data-song-number');

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
  
var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
  
  // Use the trackIndex() helper function to get the index of the current song
  var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  
  // Know what the previous song is. This includes the situation in which the next song is the first song, following the final song in the album (that is, it should "wrap" around).
  var prevSongIndex = currentIndex;
  
  // Increment the value of the index.
  currentIndex++;
  if (currentIndex >= currentAlbum.songs.length) {
    currentIndex = 0;
  }
  
  // Set a new current song to currentSongFromAlbum.
  currentlyPlayingSongNumber = currentIndex + 1;
  currentSongFromAlbum = currentAlbum.songs[currentIndex];
  
  // Update the player bar to show the new song.
  updatePlayerBarSong();
  
  // Update the HTML of the previous song's .song-item-number element with a number.
  var lastPlayingCell = $('.song-item-number[data-song-number="' + prevSongIndex + '"]');
  console.log(lastPlayingCell);
  var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');

  // Update the HTML of the new song's .song-item-number element with a pause button.
  lastPlayingCell.html(prevSongIndex);
  currentlyPlayingCell.html(pauseButtonTemplate);
  
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
var $nextButton = $('.main-controls .next');


$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  $nextButton.click(nextSong);

});

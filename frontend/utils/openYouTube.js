// ================================================================
// BLOOM — YouTube Link Opener Utility
// src/utils/openYouTube.js
//
// Usage:
//   import { openYouTubeLink } from '../utils/openYouTube';
//   await openYouTubeLink(item.url, item.title);
//
// HOW IT WORKS:
//   1. First tries to open the YouTube app directly
//   2. Falls back to opening in the device browser
//   3. Never crashes — shows a user-friendly alert on failure
// ================================================================

import { Linking, Alert, Platform } from 'react-native';

/**
 * Open a YouTube URL in the YouTube app (if installed),
 * or fall back to the device web browser.
 *
 * @param {string} url   - Full YouTube URL e.g. "https://www.youtube.com/watch?v=abc"
 * @param {string} title - Video/music title for error messages
 */
export const openYouTubeLink = async (url, title = 'this video') => {
  if (!url) {
    Alert.alert('Oops', 'This link is not available right now.');
    return;
  }

  try {
    // Convert web URL to YouTube app deep link on mobile
    // e.g. https://www.youtube.com/watch?v=XYZ  →  youtube://XYZ
    const videoId = extractYouTubeId(url);
    const appUrl  = videoId
      ? (Platform.OS === 'ios'
          ? `youtube://www.youtube.com/watch?v=${videoId}`
          : `vnd.youtube:${videoId}`)
      : url;

    // Try the YouTube app first
    const canOpenApp = videoId && await Linking.canOpenURL(appUrl);

    if (canOpenApp) {
      await Linking.openURL(appUrl);
    } else {
      // Fall back to browser
      const canOpenWeb = await Linking.canOpenURL(url);
      if (canOpenWeb) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Link',
          `Unable to open ${title}. Please check your internet connection.`,
          [{ text: 'OK' }]
        );
      }
    }
  } catch (error) {
    console.error('openYouTubeLink error:', error);
    Alert.alert(
      'Cannot Open Link',
      `Something went wrong opening ${title}.`,
      [{ text: 'OK' }]
    );
  }
};

/**
 * Extract the YouTube video ID from a full URL.
 * Handles both:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *
 * @param {string} url
 * @returns {string|null} - video ID or null
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch  = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch)  return shortMatch[1];
  return null;
}

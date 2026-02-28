import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, useWindowDimensions, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';
import RenderHtml from 'react-native-render-html';
import { API_URL } from '@env';

export default function NewsDetailsScreen() {
  const { i18n, language } = useLanguage();
  const { user } = useAuth();
  const { alerts } = useAlerts();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [currentAlert, setCurrentAlert] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Initial load and language switch handler
  useEffect(() => {
    if (params.newsId) {
        // Find the alert that matches the original ID or find equivalent in current language
        // Since alerts in context are already in the current language, we just need to find the matching one.
        // We can match by index if passed, or stricter matching.
        // But params.newsId is the link. The link changes between languages.
        // "http://.../tc_chi/..." vs "http://.../english/..."
        
        // Strategy: 
        // 1. Try to find alert exactly by link (if params.newsId matches current language list)
        // 2. If not found, try to find by switching the language in the link
        
        const langCode = language === 'zh' ? 'tc_chi' : 'english';
        const otherLangCode = language === 'zh' ? 'english' : 'tc_chi';
        
        // Normalize params.newsId to match current language expectation
        let targetLink = params.newsId;

          if (language === 'zh') {
              // Convert English link to Chinese link format
              // Case 1: /english/ -> /tc_chi/
              targetLink = targetLink.replace('/english/', '/tc_chi/');
              // Case 2: _e.html -> _c.html (common in CFS filenames)
              targetLink = targetLink.replace('_e.html', '_c.html');
              // Case 3: _en.html -> _tc.html
              targetLink = targetLink.replace('_en.html', '_tc.html');
          } else {
              // Convert Chinese link to English link format
              targetLink = targetLink.replace('/tc_chi/', '/english/');
              targetLink = targetLink.replace('_c.html', '_e.html');
              targetLink = targetLink.replace('_tc.html', '_en.html');
          }

        let found = alerts.find(a => a.link === targetLink);
        
        // If exact link match fails, try relaxed matching (e.g. filename only)
        if (!found) {
            const desiredFilename = targetLink.split('/').pop();
            // Also need to be careful with query params if any
            const cleanFilename = desiredFilename.split('?')[0];
            found = alerts.find(a => {
                if (!a.link) return false;
                const linkFilename = a.link.split('/').pop().split('?')[0];
                return linkFilename === cleanFilename;
            });
        }
        
        console.log(`[NewsDetails] Language switch debug:`);
        console.log(` - Current Language: ${language}`);
        console.log(` - Original Link (params): ${params.newsId}`);
        console.log(` - Target Link (converted): ${targetLink}`);
        console.log(` - Found in alerts list? ${found ? 'Yes' : 'No'}`);

        if (found) {
            setCurrentAlert(found);
        } else {
             // Link conversion failed or alert not found in new language list.
             // Try to force finding strictly by index if possible? No, unreliable.
             
             // If we just switched language, we ideally want to show *something* in the new language.
             // But if we can't find the matching alert, we are stuck with old data.
             
             console.log('[NewsDetails] Could not find matching alert in new language.');
        }
    }
  }, [params.newsId, alerts, language]);

const getRichContent = () => {
    if (currentAlert) {
      const alert = currentAlert;
      if (alert.actionTaken || alert.productDetails) {
        
        // Helper to render a section with a label, content, and a separator line
        const renderSection = (label, content) => `
          <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 10px; font-size: 16px; color: #333; line-height: 1.6;">
               <span style="color: #d84315; font-weight: bold;">${label} : </span>
               <span>${content}</span>
            </div>
            
            <div style="color: #333; text-align: center;">________________________________________________________</div>
          </div>
        `;

        return `
          <div style="font-family: Arial, sans-serif; padding: 5px;">
            ${alert.issueDate ? renderSection(language === 'zh' ? '發出日期' : 'Issue Date', alert.issueDate) : ''}
            ${alert.source ? renderSection(language === 'zh' ? '資料來源' : 'Source', alert.source) : ''}
            ${alert.foodItem ? renderSection(language === 'zh' ? '食品' : 'Food Product', alert.foodItem) : ''}
            
            ${alert.productDetails ? 
              renderSection(language === 'zh' ? '產品名稱及資料' : 'Product Name and Description', alert.productDetails.replace(/\n/g, '<br/>')) 
              : (alert.description ? renderSection(language === 'zh' ? '產品描述' : 'Description', alert.description) : '')}

            ${alert.reason ? renderSection(language === 'zh' ? '發出警報原因' : 'Reason For Issuing Alert', alert.reason.replace(/\n/g, '<br/>')) : ''}
            
            ${alert.actionTaken ? renderSection(language === 'zh' ? '食物安全中心採取的行動' : 'Action Taken', alert.actionTaken.replace(/\n/g, '<br/>')) : ''}
            
            ${alert.adviceToTrade ? renderSection(language === 'zh' ? '給業界的建議' : 'Advice to the Trade', alert.adviceToTrade.replace(/\n/g, '<br/>')) : ''}
            
            ${alert.adviceToConsumers ? renderSection(language === 'zh' ? '給消費者的建議' : 'Advice to Consumers', alert.adviceToConsumers.replace(/\n/g, '<br/>')) : ''}
            
            ${alert.moreInfo ? renderSection(language === 'zh' ? '更多資料' : 'More Information', alert.moreInfo.replace(/\n/g, '<br/>')) : ''}
          </div>
        `;
      }
      if (alert.description) return alert.description;
    }
    return params.content;
  };

  const displayTitle = currentAlert ? currentAlert.title : params.title;
  const displayDate = currentAlert ? (currentAlert.publishDate || currentAlert.pubDate) : params.date;
  const displayContent = getRichContent();

  useEffect(() => {
    if (params.newsId) {
      fetchComments();
    }
  }, [params.newsId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/GetComments?newsId=${params.newsId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      Alert.alert(i18n.error, i18n.pleaseLoginFirst);
      return;
    }

    const commentData = {
      userId: user.userId,
      userName: user.username,
      comments: newComment,
      time: new Date().toLocaleString(),
      district: 'Hong Kong', 
      newsId: params.newsId
    };

    try {
      
      const saveResponse = await fetch(`${API_URL}/SaveComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (saveResponse.ok) {
        
        fetchComments();
        setNewComment('');
      } else {
        Alert.alert(i18n.error, i18n.saveError);
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      Alert.alert(i18n.error, i18n.connectError);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
            <Text style={styles.backText}>{i18n.return}</Text>
          </TouchableOpacity>
          <TranslateButton />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.date}>{displayDate || new Date().toLocaleDateString()}</Text>
          <View style={styles.divider} />
          {displayContent ? (
            <RenderHtml
              contentWidth={width}
              source={{ html: displayContent }}
              tagsStyles={{
                p: { fontSize: 16, lineHeight: 24, color: '#444', marginBottom: 10 },
                li: { fontSize: 16, lineHeight: 24, color: '#444' },
              }}
            />
          ) : (
            <Text style={styles.content}>{i18n.noContent}</Text>
          )}

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {i18n.contentSource}
            </Text>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>{i18n.comments}</Text>

          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={i18n.writeComment}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity onPress={handleSendComment} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {comments.length === 0 ? (
            <Text style={styles.noComments}>{i18n.noComments}</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.userName}:</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentMeta}>
                  {comment.time} ({comment.district})
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf5e5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fbf5e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 0,
    shadowColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#2d5a27',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d5a27',
  },
  date: {
    fontSize: 14,
    color: '#8c867a',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e6dfcf',
    marginVertical: 15,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#5d574a',
  },
  commentsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  commentsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d5a27',
  },
  noComments: {
    fontStyle: 'italic',
    color: '#8c867a',
    textAlign: 'center',
    marginTop: 20,
  },
  commentItem: {
    backgroundColor: '#fbf5e5',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e6dfcf',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2d5a27',
    fontSize: 14,
  },
  commentText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#5d574a',
    lineHeight: 22,
  },
  commentMeta: {
    fontSize: 12,
    color: '#8c867a',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#d1cabb',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#5d574a',
  },
  sendButton: {
    backgroundColor: '#2d5a27',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  footerContainer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e6dfcf',
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#8c867a',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

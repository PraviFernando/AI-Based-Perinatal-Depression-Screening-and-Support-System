// ================================================================
// PROGRESS SCREEN — ProgressScreen.js  (Sinhala UI)
// ================================================================
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';

const { width } = Dimensions.get('window');

const moodScore = { happy:5, stressed:3, sad:1 };
const emotionConfig = {
  happy:    { emoji:'😊', barColor:'#FFD54F', barBg:'#FFFDE7', label:SI.happy    },
  sad:      { emoji:'😔', barColor:'#7986CB', barBg:'#EDE7F6', label:SI.sad      },
  stressed: { emoji:'😟', barColor:'#CE93D8', barBg:'#F3E5F5', label:SI.stressed },
};
const riskConfig = {
  low:    { label:'අඩු',   color:colors.riskLowDark,    bg:'#E8F5E9', dot:'🟢' },
  medium: { label:'මධ්‍යම', color:colors.riskMediumDark, bg:'#FFFDE7', dot:'🟡' },
};
const ACHIEVEMENTS = [
  {icon:'🌸',title:'7-දිනක පිවිසීම',  desc:'දින 7 ක් ම ලුහුබැඳීම',          earned:true },
  {icon:'🧘',title:'සන්සුම් සෙවන',   desc:'ශ්වාස ව්‍යායාම 5 ක් කළා',       earned:true },
  {icon:'🌱',title:'ශ්‍රේෂ්ඨව වේ',     desc:'දිනකට 3 ක් දිගටම',              earned:true },
  {icon:'🎮',title:'ක්‍රීඩා & සුවය',  desc:'ක්‍රීඩා 5 ම ක්‍රීඩා කළා',        earned:false},
  {icon:'💜',title:'ආත්ම රැකවරණ',     desc:'සතිය පුරා ඇප් භාවිතය',           earned:false},
  {icon:'🎨',title:'නිර්මාණ ශ්‍රේෂ්ඨ', desc:'ගස් + මණ්ඩල',                   earned:false},
  {icon:'📓',title:'ශ්‍රේෂ්ඨ හදවත',   desc:'ප්‍රශ්න 5 ම',                    earned:false},
  {icon:'🌟',title:'21 දිනක ගමන',     desc:'දිනකින් 21 ක්',                  earned:false},
];

const ProgressScreen = ({ navigation }) => {
  const { moodHistory } = useApp();
  const [tab, setTab] = useState('chart');
  const weekData   = moodHistory.slice(-7);
  const happyDays  = weekData.filter(d=>d.emotion==='happy').length;
  const mediumDays = weekData.filter(d=>d.risk==='medium').length;
  const avgScore   = weekData.length
    ? (weekData.reduce((s,d)=>s+(moodScore[d.emotion]||3),0)/weekData.length).toFixed(1) : '3.0';

  const narratives = [
    `ඔබ සතිය ${weekData.length} දිනකදීම ඔබ වෙනුවෙන් ඉදිරිව ගිය 💜`,
    happyDays>0 ? `ඔබ ${happyDays}  ${happyDays>1?'':''}සතුටු දිනක් ලැබුව — ඒ ශ්‍රේෂ්ඨ! 😊` : 'සෑම පිවිසීමක්ම ආදරයකි 🌸',
    mediumDays>0 ? `ඔබ ${mediumDays} ශ්‍රේෂ්ඨ දිනකට මුහුණ දෙන ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ඔබ ශ්‍රේෂ්ඨ 💪` : 'ඔබේ අවදානම් මට්ටම සතිය ශ්‍රේෂ්ඨ 💚',
    `ඔබේ සාමාන්‍ය ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ${avgScore}/5`,
  ];

  const MAX_BAR = 110;

  const renderChart = () => (
    <View style={s.chartCard}>
      <Text style={s.chartTitle}>{SI.moodTracker}</Text>
      <View style={s.chartArea}>
        {weekData.map((d,i) => {
          const ec = emotionConfig[d.emotion]||emotionConfig.stressed;
          const rc = riskConfig[d.risk]||riskConfig.low;
          const barH = ((moodScore[d.emotion]||3)/5)*MAX_BAR;
          const isToday = i===weekData.length-1;
          return (
            <View key={i} style={s.barCol}>
              <Text style={s.barEmoji}>{ec.emoji}</Text>
              <Text style={s.barRisk}>{rc.dot}</Text>
              <View style={[s.barBg,{backgroundColor:ec.barBg}]}>
                <View style={[s.barFill,{height:barH,backgroundColor:ec.barColor}]}/>
              </View>
              <Text style={[s.barDay,isToday&&s.barDayToday]}>{d.day}</Text>
            </View>
          );
        })}
      </View>
      <View style={s.legend}>{Object.entries(emotionConfig).map(([k,ec])=>(
        <View key={k} style={s.legendItem}><Text style={s.legendEmoji}>{ec.emoji}</Text><Text style={s.legendLabel}>{ec.label}</Text></View>
      ))}</View>
    </View>
  );

  const renderSummary = () => (
    <View>
      <LinearGradient colors={['#EDE7F6','#FCE4EC']} style={s.summaryCard}>
        <Text style={s.summaryTitle}>{SI.weekStory}</Text>
        {narratives.map((n,i)=>(
          <View key={i} style={s.summaryRow}>
            <Text style={s.summaryDot}>💜</Text>
            <Text style={s.summaryText}>{n}</Text>
          </View>
        ))}
      </LinearGradient>
      <LinearGradient colors={['#F0E8FF','#FFE8F5','#E8F8FF']} style={s.feedbackCard}>
        <Text style={s.feedbackEmoji}>🌸</Text>
        <Text style={s.feedbackTitle}>{SI.doingAmazing}</Text>
        <Text style={s.feedbackText}>{SI.affirmations?.[0]}</Text>
      </LinearGradient>
      <View style={s.riskCard}>
        <Text style={s.riskTitle}>{SI.riskOverview}</Text>
        {weekData.map((d,i)=>{
          const ec=emotionConfig[d.emotion]||emotionConfig.stressed;
          const rc=riskConfig[d.risk]||riskConfig.low;
          const isToday=i===weekData.length-1;
          return (
            <View key={i} style={s.riskRow}>
              <Text style={[s.riskDay,isToday&&{color:colors.lavenderDark,fontWeight:'800'}]}>
                {d.day}{isToday?` ${SI.today}`:''}
              </Text>
              <Text style={s.riskEmoji}>{ec.emoji}</Text>
              <View style={[s.riskBadge,{backgroundColor:rc.bg}]}>
                <Text style={[s.riskLabel,{color:rc.color}]}>{rc.dot} {rc.label} {SI.risk}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View>
      <Text style={s.achIntro}>{ACHIEVEMENTS.filter(a=>a.earned).length} {SI.outOf} {ACHIEVEMENTS.length} {SI.earnedBadges}</Text>
      {ACHIEVEMENTS.map((ach,i)=>(
        <View key={i} style={[s.achCard,!ach.earned&&s.achCardLocked]}>
          <View style={[s.achIconBox,!ach.earned&&{opacity:0.4}]}><Text style={s.achIcon}>{ach.icon}</Text></View>
          <View style={s.achInfo}>
            <Text style={[s.achTitle,!ach.earned&&{color:colors.textMuted}]}>{ach.title}</Text>
            <Text style={s.achDesc}>{ach.desc}</Text>
          </View>
          <View style={ach.earned?s.earnedBadge:s.lockedBadge}>
            <Text style={ach.earned?s.earnedText:s.lockedText}>{ach.earned?SI.earnedBadge:SI.lockedBadge}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF','#FFF0F8']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.title}>{SI.yourJourney}</Text>
          <View style={s.statsRow}>
            {[
              {emoji:'📊',val:`${avgScore}/5`,label:SI.avgMood,  colors:['#EDE7F6','#D1C4E9']},
              {emoji:'🔥',val:`${weekData.length}`,  label:SI.dayStreak, colors:['#FCE4EC','#F8BBD9']},
              {emoji:'😊',val:`${happyDays}`,  label:SI.happyDays, colors:['#E8F5E9','#C8E6C9']},
            ].map((st,i)=>(
              <LinearGradient key={i} colors={st.colors} style={s.statCard}>
                <Text style={s.statEmoji}>{st.emoji}</Text>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </LinearGradient>
            ))}
          </View>
          <View style={s.tabRow}>
            {[{id:'chart',label:SI.chartTab},{id:'summary',label:SI.summaryTab},{id:'achievements',label:SI.badgesTab}].map(t=>(
              <TouchableOpacity key={t.id} onPress={()=>setTab(t.id)} style={[s.tabBtn,tab===t.id&&s.tabBtnActive]}>
                <Text style={[s.tabBtnText,tab===t.id&&s.tabBtnTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {tab==='chart'        && renderChart()}
          {tab==='summary'      && renderSummary()}
          {tab==='achievements' && renderAchievements()}
          <View style={{height:110}}/>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  container:{flex:1},gradient:{flex:1},scroll:{paddingHorizontal:spacing.md,paddingTop:60},
  title:{fontSize:26,fontWeight:'900',color:colors.textPrimary,marginBottom:spacing.lg},
  statsRow:{flexDirection:'row',gap:8,marginBottom:spacing.lg},
  statCard:{flex:1,borderRadius:radius.xl,padding:14,alignItems:'center',...shadows.soft},
  statEmoji:{fontSize:22,marginBottom:5},statVal:{fontSize:20,fontWeight:'900',color:colors.textPrimary},
  statLabel:{fontSize:10,color:colors.textSecondary,fontWeight:'600',textAlign:'center',marginTop:2},
  tabRow:{flexDirection:'row',gap:6,marginBottom:spacing.lg},
  tabBtn:{flex:1,paddingVertical:10,borderRadius:radius.full,backgroundColor:colors.white,alignItems:'center',...shadows.soft},
  tabBtnActive:{backgroundColor:colors.lavenderDark},
  tabBtnText:{fontSize:10,fontWeight:'700',color:colors.textSecondary},
  tabBtnTextActive:{color:colors.white},
  chartCard:{backgroundColor:colors.white,borderRadius:radius.xl,padding:spacing.lg,marginBottom:spacing.lg,...shadows.card},
  chartTitle:{fontSize:16,fontWeight:'800',color:colors.textPrimary,marginBottom:spacing.lg},
  chartArea:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',height:170,marginBottom:spacing.md},
  barCol:{flex:1,alignItems:'center'},barEmoji:{fontSize:14,marginBottom:2},barRisk:{fontSize:9,marginBottom:3},
  barBg:{flex:1,width:'72%',borderRadius:6,justifyContent:'flex-end',overflow:'hidden'},
  barFill:{borderRadius:6,minHeight:6},
  barDay:{fontSize:9,color:colors.textMuted,marginTop:4,fontWeight:'600'},
  barDayToday:{color:colors.lavenderDark,fontWeight:'900'},
  legend:{flexDirection:'row',justifyContent:'space-around',paddingTop:spacing.sm,borderTopWidth:1,borderTopColor:colors.softGray},
  legendItem:{flexDirection:'row',alignItems:'center',gap:4},
  legendEmoji:{fontSize:14},legendLabel:{fontSize:10,color:colors.textMuted},
  summaryCard:{borderRadius:radius.xl,padding:spacing.lg,marginBottom:spacing.md,...shadows.soft},
  summaryTitle:{fontSize:17,fontWeight:'800',color:colors.textPrimary,marginBottom:spacing.md},
  summaryRow:{flexDirection:'row',alignItems:'flex-start',gap:10,marginBottom:10},
  summaryDot:{fontSize:16},summaryText:{flex:1,fontSize:14,color:colors.textSecondary,lineHeight:20},
  feedbackCard:{borderRadius:radius.xl,padding:spacing.xl,alignItems:'center',marginBottom:spacing.lg,...shadows.card},
  feedbackEmoji:{fontSize:48,marginBottom:12},
  feedbackTitle:{fontSize:20,fontWeight:'800',color:colors.textPrimary,marginBottom:10},
  feedbackText:{fontSize:14,color:colors.textSecondary,textAlign:'center',lineHeight:22},
  riskCard:{backgroundColor:colors.white,borderRadius:radius.xl,padding:spacing.lg,...shadows.soft},
  riskTitle:{fontSize:15,fontWeight:'800',color:colors.textPrimary,marginBottom:12},
  riskRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10},
  riskDay:{width:70,fontSize:11,fontWeight:'700',color:colors.textSecondary},
  riskEmoji:{fontSize:18,width:28},riskBadge:{borderRadius:radius.full,paddingVertical:4,paddingHorizontal:12},
  riskLabel:{fontSize:11,fontWeight:'700'},
  achIntro:{fontSize:13,color:colors.textMuted,marginBottom:spacing.md},
  achCard:{flexDirection:'row',alignItems:'center',backgroundColor:colors.white,borderRadius:radius.lg,padding:spacing.md,marginBottom:10,...shadows.soft},
  achCardLocked:{opacity:0.6},
  achIconBox:{width:48,height:48,borderRadius:12,backgroundColor:colors.lavenderLight,justifyContent:'center',alignItems:'center',marginRight:12},
  achIcon:{fontSize:24},achInfo:{flex:1},
  achTitle:{fontSize:14,fontWeight:'700',color:colors.textPrimary},achDesc:{fontSize:12,color:colors.textMuted,marginTop:2},
  earnedBadge:{backgroundColor:colors.mintLight,paddingVertical:4,paddingHorizontal:10,borderRadius:radius.full},
  earnedText:{fontSize:11,color:colors.mintDark,fontWeight:'700'},
  lockedBadge:{backgroundColor:colors.softGray,paddingVertical:4,paddingHorizontal:10,borderRadius:radius.full},
  lockedText:{fontSize:11,color:colors.textMuted,fontWeight:'600'},
});

export default ProgressScreen;

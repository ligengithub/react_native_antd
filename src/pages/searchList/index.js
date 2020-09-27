import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  TextInput, 
  Image, 
  Text, 
  FlatList, 
  TouchableOpacity,
} from 'react-native';
import _ from 'lodash';
import TouchableButton from '../../components/touchableButton'
import httpUtil from '../../../utils/httpUtil';
import Video from 'react-native-video';

const playTypeArray = [
  {
    iconName:'cycle',
    btnName:'循环播放'
  },
  {
    iconName:'creative-cloud',
    btnName:'随机播放'
  },
  {
    iconName:'minus',
    btnName:'单首播放'
  }
];

class SearchList extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      inpValue: '',
      songList: [],
      songUrl: null,
      isPaused: false,
      playType: 0,
      songName: '',
      currentIndex: null

    };
  }
  searchMusicList = _.debounce((keyword) => {
    httpUtil.get(`https://api.zsfmyz.top/music/list?p=1&n=10&w=${keyword}`).then(res => {
    if (res.data && res.data.code === "0") {
        this.setState({
          songList: res.data.data.list
        })
      }
    })
  }, 500)

  getMusicUrl = (ctx) => {
    const { songmid, songName, index} = ctx;
    console.log(songmid);
    const that = this;
    httpUtil.get(`https://api.zsfmyz.top/music/song?songmid=${songmid}&guid=126548448`).then(res => {
    if (res.data && res.data.code === '0') {
        let data = res.data.data;
        that.setState({
          songUrl: data.musicUrl,
          songName,
          currentIndex: Number(index)
        })
      }
    })
  }
  
  handlePlay() {
    this.setState({
      isPaused: !this.state.isPaused
    });
  }

  handlePlayPrev(){
    const { songList, currentIndex } = this.state;
    let _currentIndex = currentIndex ? Number(_.cloneDeep(currentIndex)) : 0;
    let ids = _currentIndex === 0 ? 0 : --_currentIndex;
    if (songList[ids]) {
      this.getMusicUrl({
        songmid: songList[ids].songmid,
        songName: songList[ids].songname,
        index: ids
      })
    }
  }

  handlePlayNext(){
    const { songList, currentIndex } = this.state;
    let _currentIndex = currentIndex ? Number(_.cloneDeep(currentIndex)) : 0;
    let ids = _currentIndex >= songList.length ? songList.length : ++_currentIndex;
    if (songList[ids]) {
      this.getMusicUrl({
        songmid: songList[ids].songmid,
        songName: songList[ids].songname,
        index: ids
      })
    }
  }

  handleChangePlayType(){
    const { playType } = this.state;
    this.setState({
      playType: playType >= 2 ? 0 : playType + 1
    })
  }

  render() {
    const {songList, inpValue, songUrl, isPaused, playType, songName, currentIndex} = this.state;
    const renderItem = (({ item, index }) => {
      return (
        <TouchableOpacity style={currentIndex === index ? styles.itemSelected : styles.item} onPress={() => {
          this.getMusicUrl({
            songmid:item.songmid, 
            songName: item.songname, 
            index
          });
        }}>
          <Text style={styles.itemName}>{item.songname}</Text>
          <Text style={styles.itemText}>{`歌手:${item.singer.name}`}</Text>
        </TouchableOpacity>
      );
    })
    return (
      <View style={{height: '100%'}}>
        <TextInput 
          style={styles.sInp} 
          value={inpValue}
          onChangeText={(val) => {
            this.setState({
              inpValue: val
            })
            this.searchMusicList(val);
          }}
        />
        {
          songUrl ? <Video
              style={styles.video}
              audioOnly
              playInBackground
              volume={0.5}
              paused={isPaused}
              source={{uri: songUrl}}   // Can be a URL or a local file.
              // onEnd={this.handleVideoEnd.bind(this)}
              // onLoad={this.handleVideoLoad.bind(this)}
              // onLoadStart={this.handleVideoLoadStart.bind(this)}
              // onTimedMetadata={this.handleVideoTime.bind(this)}
              // onProgress={this.handleVideoProgress.bind(this)}
              // onVideoError={this.err.bind(this)}
              // onError={this.handleVideoError.bind(this)}               // Callback when video cannot be loaded
            /> : null
        }
        
        <FlatList
          data={songList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
        <View style={styles.control}>
          {
            songUrl ? <View >
              <Text style={styles.songName}>{songName}</Text>
            </View> : null
          }
          {
            songUrl ? <View style={styles.btnWarp}>
              <TouchableButton
                onPress={this.handlePlayPrev.bind(this)}
                iconName={ 'controller-jump-to-start'}
                buttonName='上一首'
              />
              <TouchableButton
                onPress={this.handlePlay.bind(this)}
                iconName={!isPaused ? 'controller-paus' : 'controller-play'}
                buttonName={!isPaused ? '暂停' : '播放'}
              />
              <TouchableButton
                onPress={this.handlePlayNext.bind(this)}
                iconName={ 'controller-next'}
                buttonName='下一首'
              />
              {/* <TouchableButton
                onPress={this.handleChangePlayType.bind(this)}
                iconName={playTypeArray[playType].iconName}
                buttonName={playTypeArray[playType].btnName}
              /> */}
            </View> : null
          }
          
        </View>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sInp: {
    height: 35,
    borderRadius: 5,
    borderColor: '#bfbfbf',
    borderWidth: 1,
    margin: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#dfdfdf',
    padding: 5,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 5,
    fontSize: 14
  },
  itemSelected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#b78d22',
    borderRadius: 5,
    fontSize: 14
  },
  songImg: {
    width: 40,
    height: 40
  },
  itemName: {
    flex: 1,
    marginLeft: 20,
    padding: 5,
    fontSize: 16,
  },
  itemText: {
    flex: 1,
    marginLeft: 20,
    padding: 5,
  },
  songName: {
    padding: 5,
    textAlign: 'center',    
  },
  btnWarp:{
    flexDirection:'row',
  },
  control:{
    position: 'relative',
    left: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
  },
})

export default SearchList;


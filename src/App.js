import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      preview: false,
      previewImg: null,
      deleteFile: ''
    }
  }
  render() {
    return (
      <div className="app">
        {
          this.state.preview ? 
          <div className='preview' onClick={this.hidePreview}>
            { this.state.previewImg ? <img alt={this.state.previewImg.name} src={this.state.previewImg.src} /> : null }
          </div> 
          : null 
        }
        <div className='left'>
          我的相册
        </div>
        <div className='right'>
          <input 
            ref={el => { this.fileInput = el }}
            className='hide'
            type='file'  
            accept='image/png,image/jpeg,image/gif,image/jpg' 
            multiple={true} 
            onChange={this.handleChange}
          />
          { 
            this.state.files.map((file, index) => {
              return (
                <div 
                  key={index} 
                  className='img-wrap' 
                  onClick={this.showPreview} 
                  data-index={index} 
                  draggable={true} 
                  onDragStart={this.handleImgDragStart} 
                  onDragEnd={this.handleImgDragEnd}
                >
                  <div className='close' onClick={this.handleDelete} data-index={index}></div>
                  <img draggable={false} alt={file.name} src={file.src} />
                </div>
              )
            }) 
          }
          { 
            this.state.files.length === 4 ? null : 
            <button className='btn-select' onClick={this.handleSelect} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>选择 or 拖拽</button> 
          }
          <button className='btn-upload' onClick={this.handleUpload}>上传</button>
          <div 
            ref={el => this.dustbin = el}
            className='dustbin' 
            onDragEnter={this.handleDustDragEnter} 
            onDragOver={this.handleDustDragOver}
            onDrop={this.handleDustDrop} 
            onDragLeave={this.handleDustDragLeave} 
          >
            垃圾箱
            <div style={{color:'red', marginTop: 10}}>{this.state.deleteFile ? this.state.deleteFile + '被删除了' : ''}</div>
          </div>
        </div>
      </div>
    );
  }
  handleSelect = event => {
    event.preventDefault()
    this.fileInput.click()
  }
  handleDragOver = event => {
    event.preventDefault()
    event.stopPropagation()
  }
  handleDrop = event => {
    event.preventDefault()
    event.stopPropagation()
    const { files } = this.state
    Array.prototype.forEach.call(event.dataTransfer.files, file => {
      const src = URL.createObjectURL(file)
      file.src = src
      this.setState({
        files: [...files, file]
      })
      this.fileInput.value = ''
    })
  }
  handleUpload = event => {
    event.preventDefault()
    const { files } = this.state 
    if (files.length === 0) {
      this.fileInput.click()
      return
    }
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`img${index+1}`, file)
    })
    // xhr2上传文件 或者 fetch
    const xhr = new XMLHttpRequest()
    xhr.timeout = 3000
    xhr.open('POST', 'upload')
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const percent = event.loaded / event.total
        console.log(percent)
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200 && xhr.readyState === 4) {
        alert('文件上传成功')
      } else {
        alert('文件上传失败')
      }
    }
    // xhr.send(formData)
    alert('文件上传成功')
    this.setState({
      files: []
    })
    this.fileInput.value = ''
  }
  handleDelete = event => {
    event.preventDefault()
    event.stopPropagation()
    const { target: { dataset: { index } } } = event
    const { files } = this.state
    
    const newFiles = files.filter((file, index2) => {
      if (index2 === +index) {
        URL.revokeObjectURL(file.src)
        return false
      }
      return true
    })
    this.setState({
      files: newFiles
    })
  }
  handleChange = event => {
    event.preventDefault()
    const { files } = this.state
    Array.prototype.forEach.call(this.fileInput.files, file => {
      const src = URL.createObjectURL(file)
      file.src = src
      this.setState({
        files: [...files, file]
      })
      this.fileInput.value = ''
    })
  }
  showPreview = event => {
    const { currentTarget: { dataset: { index } } } = event
    const { files } = this.state
    this.setState({
      preview: true,
      previewImg: {
        name: files[+index].name,
        src: files[+index].src
      }
    })
  }
  hidePreview = event => {
    this.setState({
      preview: false,
      previewImg: null
    })
  }
  handleImgDragStart = event => {
    const { dataTransfer, currentTarget: { dataset: { index } } } = event
    dataTransfer.effectAllowed = 'move'
    dataTransfer.setData('text/plain', index)
    event.currentTarget.style.borderColor = '#0000FF'
    this.dustbin.style.borderColor = '#FF0000'
    this.setState({
      deleteFile: ''
    })
  }
  handleImgDrag = event => {

  }
  handleImgDragEnd = event => {
    const { dataTransfer } = event
    dataTransfer.clearData('text/plain')
    event.currentTarget.style.borderColor = '#000000'
    this.dustbin.style.borderColor = '#CCCCCC'
  }
  handleDustDragEnter = event => {
    
  }
  handleDustDragOver = event => {
    
  }
  handleDustDrop = event => {
    const { dataTransfer } = event
    const index = dataTransfer.getData('text/plain')
    const { files } = this.state
    let deleteFile 
    const newFiles = files.filter((file, index2) => {
      if (index2 === +index) {
        deleteFile = file.name
        URL.revokeObjectURL(file.src)
        return false
      }
      return true
    })
    this.setState({
      files: newFiles,
      deleteFile
    })
    event.currentTarget.style.borderColor = '#cccccc'
  }
  handleDustDragLeave = event => {
    
  }
  componentWillMount() {
    document.ondragover = event => {
      event.preventDefault()
      event.stopPropagation()
    }
    document.ondrop = event => {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  componentWillUnmount() {
    const { files } = this.state
    files.forEach(file => {
      URL.revokeObjectURL(file.src)
    })
  }
}

export default App;

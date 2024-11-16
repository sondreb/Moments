import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PhotoElement {
  id: number;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

@Component({
  selector: 'app-photo-collage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-collage.component.html',
  styleUrls: ['./photo-collage.component.css']
})
export class PhotoCollageComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private photos: PhotoElement[] = [];
  private scale = 1;
  private isDragging = false;
  private selectedPhoto: PhotoElement | null = null;
  private lastX = 0;
  private lastY = 0;
  private maxZIndex = 0;

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
    this.setupEventListeners();
  }

  private setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.render();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('wheel', this.handleZoom.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
  }

  handleFileSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.loadImages(Array.from(files));
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    this.loadImages(files.filter(file => file.type.startsWith('image/')));
  }

  private async loadImages(files: File[]) {
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      
      this.photos.push({
        id: Date.now() + Math.random(),
        url,
        x: Math.random() * (this.canvas.width - 200),
        y: Math.random() * (this.canvas.height - 200),
        width: 200,
        height: (200 * img.height) / img.width,
        zIndex: ++this.maxZIndex,
        rotation: (Math.random() - 0.5) * 0.5
      });
    }
    this.render();
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const sortedPhotos = [...this.photos].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const photo of sortedPhotos) {
      const img = new Image();
      img.src = photo.url;
      
      this.ctx.save();
      this.ctx.translate(photo.x + photo.width/2, photo.y + photo.height/2);
      this.ctx.rotate(photo.rotation);
      this.ctx.drawImage(img, -photo.width/2, -photo.height/2, photo.width, photo.height);
      this.ctx.restore();
    }
  }

  saveCollage() {
    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'collage.png';
    link.href = dataUrl;
    link.click();
  }

  private handleZoom(event: WheelEvent) {
    event.preventDefault();
    const delta = -Math.sign(event.deltaY) * 0.1;
    this.scale = Math.max(0.1, Math.min(5, this.scale + delta));
    this.render();
  }

  private handleMouseDown(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.lastX = offsetX;
    this.lastY = offsetY;
    this.selectedPhoto = this.findPhotoAtPosition(offsetX, offsetY);
    if (this.selectedPhoto) this.isDragging = true;
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.selectedPhoto) return;
    
    const dx = event.offsetX - this.lastX;
    const dy = event.offsetY - this.lastY;
    
    this.selectedPhoto.x += dx;
    this.selectedPhoto.y += dy;
    
    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
    
    this.render();
  }

  private handleMouseUp() {
    this.isDragging = false;
    this.selectedPhoto = null;
  }

  private findPhotoAtPosition(x: number, y: number): PhotoElement | null {
    return this.photos.find(photo => 
      x >= photo.x && x <= photo.x + photo.width &&
      y >= photo.y && y <= photo.y + photo.height
    ) || null;
  }

  private handleDoubleClick(event: MouseEvent) {
    const photo = this.findPhotoAtPosition(event.offsetX, event.offsetY);
    if (photo) {
      this.maxZIndex++;
      photo.zIndex = this.maxZIndex;
      this.render();
    }
  }
}

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
  scale: number;
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
  private touches: Touch[] = [];
  private lastDistance = 0;
  private lastTapTime = 0;
  private initialTouchDistance = 0;
  private activePhoto: PhotoElement | null = null;
  private panX = 0;
  private panY = 0;
  private zoomPoint = { x: 0, y: 0 };

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
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
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
        scale: 1,
        rotation: (Math.random() - 0.5) * 0.5
      });
    }
    this.render();
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const sortedPhotos = [...this.photos].sort((a, b) => a.zIndex - b.zIndex);
    
    // Apply canvas transforms
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.scale, this.scale);
    
    for (const photo of sortedPhotos) {
      const img = new Image();
      img.src = photo.url;
      
      this.ctx.save();
      this.ctx.translate(photo.x + photo.width/2, photo.y + photo.height/2);
      this.ctx.rotate(photo.rotation);
      this.ctx.scale(photo.scale, photo.scale);
      this.ctx.drawImage(img, -photo.width/2, -photo.height/2, photo.width, photo.height);
      this.ctx.restore();
    }
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
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
    // Transform screen coordinates to canvas coordinates
    const canvasX = (x - this.panX) / this.scale;
    const canvasY = (y - this.panY) / this.scale;
    
    return this.photos.find(photo => 
      canvasX >= photo.x && canvasX <= photo.x + photo.width &&
      canvasY >= photo.y && canvasY <= photo.y + photo.height
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

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.touches = Array.from(event.touches);

    if (this.touches.length === 1) {
      const touch = this.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Check for double tap
      const now = Date.now();
      if (now - this.lastTapTime < 300) {
        this.handleDoubleClick({ offsetX: x, offsetY: y } as MouseEvent);
      }
      this.lastTapTime = now;

      // Handle single touch as mouse down
      this.handleMouseDown({ offsetX: x, offsetY: y } as MouseEvent);
    } else if (this.touches.length === 2) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (this.touches[0].clientX + this.touches[1].clientX) / 2 - rect.left;
      const y = (this.touches[0].clientY + this.touches[1].clientY) / 2 - rect.top;
      
      // Store zoom center point
      this.zoomPoint = {
        x: (x - this.panX) / this.scale,
        y: (y - this.panY) / this.scale
      };
      
      this.activePhoto = this.findPhotoAtPosition(x, y);
      this.initialTouchDistance = this.getTouchDistance(this.touches[0], this.touches[1]);
    }
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    const touches = Array.from(event.touches);

    if (touches.length === 1 && this.isDragging) {
      const touch = touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      this.handleMouseMove({ offsetX: x, offsetY: y } as MouseEvent);
    } else if (touches.length === 2) {
      const currentDistance = this.getTouchDistance(touches[0], touches[1]);
      const prevScale = this.scale;
      const delta = (currentDistance - this.initialTouchDistance) * 0.002; // Changed from 0.001 to 0.002

      if (this.activePhoto) {
        // Zoom individual photo
        this.activePhoto.scale = Math.max(0.1, Math.min(5, this.activePhoto.scale + delta));
      } else {
        // Zoom canvas towards touch point
        this.scale = Math.max(0.1, Math.min(5, this.scale + delta));
        
        const rect = this.canvas.getBoundingClientRect();
        const centerX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
        const centerY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
        
        // Adjust pan to keep zoom point steady
        const scaleDiff = this.scale - prevScale;
        this.panX = centerX - (this.zoomPoint.x * this.scale);
        this.panY = centerY - (this.zoomPoint.y * this.scale);
      }
      
      this.initialTouchDistance = currentDistance;
      this.render();
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length === 0) {
      this.handleMouseUp();
      this.activePhoto = null;
    }
    this.touches = Array.from(event.touches);
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

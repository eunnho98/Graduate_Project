import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split


class CNNBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()

        self.layers = nn.Sequential(
            nn.Conv1d(in_channels, out_channels, kernel_size=3),
            nn.MaxPool1d(kernel_size=2),
            nn.ReLU(),
            nn.BatchNorm1d(out_channels),
        )

    def forward(self, x):
        y = self.layers(x)
        return y


class CNN1DRegression(nn.Module):
    def __init__(self, output_size):
        self.output_size = output_size
        super().__init__()

        self.blocks = nn.Sequential(  # x = (8, 3, 20)
            CNNBlock(3, 64),  # x = (8, 64, 9)
            CNNBlock(64, 128),  # x=(8, 128, 4)
        )

        self.layers = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 3, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.Linear(32, output_size),
        )

    def forward(self, x):
        z = self.blocks(x)
        y = self.layers(z)
        return y


class CNN1DRegression_gyro(nn.Module):
    def __init__(self, output_size):
        self.output_size = output_size
        super().__init__()

        self.blocks = nn.Sequential(  # x = (8, 3, 20)
            CNNBlock(6, 64),  # x = (8, 64, 9)
            CNNBlock(64, 128),  # x=(8, 128, 4)
        )

        self.layers = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 3, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.Linear(32, output_size),
        )

    def forward(self, x):
        z = self.blocks(x)
        y = self.layers(z)
        return y
